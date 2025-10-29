import { useUser } from "../contexts";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Avatar from "../components/Avatar";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import RichTextDisplay from "../components/ui/RichTextDisplay";
import { LayoutDashboard, X, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../styles/Profile.module.css";
import { BeatLoader } from "react-spinners";
import viberLogo from "../assets/logos/viber.png";
import whatsappLogo from "../assets/logos/whatsapp.png";
import facebookLogo from "../assets/logos/facebook.png";
import messengerLogo from "../assets/logos/messenger.png";
import tiktokLogo from "../assets/logos/tiktok.png";
import instagramLogo from "../assets/logos/instagram.png";
import { listMyUserServices } from "../services/userServicesService";
import { listMyBusinessesInside } from "../services/userBusinessInsideService";
import { listMyBusinessesOutside } from "../services/userBusinessOutsideService";

function Profile() {
  const { profile, locationAssociations, profileLoading } = useUser();
  const navigate = useNavigate();
  const [userService, setUserService] = useState(null);
  const [businessInside, setBusinessInside] = useState(null);
  const [businessOutside, setBusinessOutside] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageGallery, setImageGallery] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openImageModal = (imageUrl, allImages) => {
    setSelectedImage(imageUrl);
    setImageGallery(allImages);
    setCurrentImageIndex(allImages.indexOf(imageUrl));
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setImageGallery([]);
    setCurrentImageIndex(0);
  };

  const goToPreviousImage = () => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : imageGallery.length - 1;
    setCurrentImageIndex(newIndex);
    setSelectedImage(imageGallery[newIndex]);
  };

  const goToNextImage = () => {
    const newIndex = currentImageIndex < imageGallery.length - 1 ? currentImageIndex + 1 : 0;
    setCurrentImageIndex(newIndex);
    setSelectedImage(imageGallery[newIndex]);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!profile?.id) return;

      setDataLoading(true);

      // Load service
      const { data: serviceData } = await listMyUserServices(profile.id);
      if (serviceData && serviceData.length > 0) {
        setUserService(serviceData[0]);
      }

      // Load business inside
      const { data: insideData } = await listMyBusinessesInside(profile.id);
      if (insideData && insideData.length > 0) {
        setBusinessInside(insideData[0]);
      }

      // Load business outside
      const { data: outsideData } = await listMyBusinessesOutside(profile.id);
      if (outsideData && outsideData.length > 0) {
        setBusinessOutside(outsideData[0]);
      }

      setDataLoading(false);
    };

    loadData();
  }, [profile?.id]);

  // Si pas de profil, afficher un message (pas de loading car géré par ProtectedRoute + UserContext)
  if (!profile) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="page-not-found">
            <h2>Profile Not Found</h2>
            <p>No profile data available. Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <div className={styles.profileHeader}>
          <div className="page-header">
            <h2>My Profile</h2>
          </div>
          <Button
            className="btn-dashboard"
            onClick={() => navigate("/dashboard")}
            aria-label="Go to Dashboard"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.profileAvatar}>
              <Avatar
                src={profile.avatar_url}
                alt="Profile avatar"
                size="large"
                fallback={profile.full_name || profile.username || "User"}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <div className={styles.profileField}>
                <span className="sr-only">Loading location information...</span>
                <BeatLoader
                  color="#ffffff"
                  size={8}
                  margin={2}
                  aria-hidden="true"
                />
              </div>
            ) : locationAssociations && locationAssociations.length > 0 ? (
              locationAssociations.map((association, index) => (
                <div key={association.id} className={styles.locationAssociation}>
                  <div className={styles.profileField}>
                    <label>Block:</label>
                    <span>
                      {association.location?.block || "Not specified"}
                    </span>
                  </div>
                  <div className={styles.profileField}>
                    <label>Lot:</label>
                    <span>{association.location?.lot || "Not specified"}</span>
                  </div>
                  {locationAssociations.length > 1 &&
                    index < locationAssociations.length - 1 && (
                      <hr className={styles.locationDivider} />
                    )}
                </div>
              ))
            ) : (
              <div className={styles.profileField}>
                <span>No location associations found</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.profileField}>
              <label>Username:</label>
              <span>{profile.username || "Not provided"}</span>
            </div>

            <div className={styles.profileField}>
              <label>Occupation:</label>
              <span>{profile.occupation || "Not provided"}</span>
            </div>

            <div className={styles.profileField}>
              <label>Description:</label>
              {profile.description ? (
                <RichTextDisplay content={profile.description} />
              ) : (
                <p>No description provided</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.contactLinks}>
              {profile.viber_number && (
                <a
                  href={profile.viber_number}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                  title="Contact via Viber"
                >
                  <img src={viberLogo} alt="Viber" className={styles.contactLogo} />
                </a>
              )}

              {profile.whatsapp_number && (
                <a
                  href={profile.whatsapp_number}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                  title="Contact via WhatsApp"
                >
                  <img
                    src={whatsappLogo}
                    alt="WhatsApp"
                    className={styles.contactLogo}
                  />
                </a>
              )}

              {profile.facebook_url && (
                <a
                  href={profile.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                  title="Visit Facebook profile"
                >
                  <img
                    src={facebookLogo}
                    alt="Facebook"
                    className={styles.contactLogo}
                  />
                </a>
              )}

              {profile.messenger_url && (
                <a
                  href={profile.messenger_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                  title="Contact via Messenger"
                >
                  <img
                    src={messengerLogo}
                    alt="Messenger"
                    className={styles.contactLogo}
                  />
                </a>
              )}

              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                  title="Visit Instagram profile"
                >
                  <img
                    src={instagramLogo}
                    alt="Instagram"
                    className={styles.contactLogo}
                  />
                </a>
              )}

              {profile.tiktok_url && (
                <a
                  href={profile.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                  title="Visit TikTok profile"
                >
                  <img
                    src={tiktokLogo}
                    alt="TikTok"
                    className={styles.contactLogo}
                  />
                </a>
              )}
            </div>

            {!profile.viber_number &&
              !profile.whatsapp_number &&
              !profile.facebook_url &&
              !profile.messenger_url &&
              !profile.instagram_url &&
              !profile.tiktok_url && (
                <div className={styles.profileField}>
                  <span>No contact information provided</span>
                </div>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.profileField}>
              <label>Balance:</label>
              <span className={styles.coinsBalance}>{profile.coins || 0} coins</span>
            </div>
          </CardContent>
        </Card>

        {dataLoading ? (
          <Card>
            <CardContent>
              <div className={styles.profileField} style={{ textAlign: "center" }}>
                <BeatLoader color="#ffffff" size={8} margin={2} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {userService && (
              <Card>
                <CardHeader>
                  <CardTitle>My Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.profileField}>
                    <label>Category:</label>
                    <span>{userService.category?.name || "N/A"}</span>
                  </div>

                  {userService.description && (
                    <div className={styles.profileField}>
                      <label>Description:</label>
                      <RichTextDisplay content={userService.description} />
                    </div>
                  )}

                  {userService.price_range && (
                    <div className={styles.profileField}>
                      <label>Price Range:</label>
                      <span>{userService.price_range}</span>
                    </div>
                  )}

                  {userService.availability && (
                    <div className={styles.profileField}>
                      <label>Availability:</label>
                      <span>{userService.availability}</span>
                    </div>
                  )}

                  {userService.service_location_type && (
                    <div className={styles.profileField}>
                      <label>Service Location:</label>
                      <span>
                        {userService.service_location_type === "at_provider" && "My Location"}
                        {userService.service_location_type === "mobile" && "Your Location"}
                        {userService.service_location_type === "both" && "My Location & Your Location"}
                      </span>
                    </div>
                  )}

                  {(userService.facebook_url || userService.messenger_url || userService.viber_number ||
                    userService.whatsapp_number || userService.tiktok_url || userService.instagram_url) && (
                      <div className={styles.profileField}>
                        <label>Contact:</label>
                        <div className={styles.contactLinks}>
                          {userService.viber_number && (
                            <a href={userService.viber_number} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="Viber">
                              <img src={viberLogo} alt="Viber" className={styles.contactLogo} />
                            </a>
                          )}
                          {userService.whatsapp_number && (
                            <a href={userService.whatsapp_number} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="WhatsApp">
                              <img src={whatsappLogo} alt="WhatsApp" className={styles.contactLogo} />
                            </a>
                          )}
                          {userService.facebook_url && (
                            <a href={userService.facebook_url} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="Facebook">
                              <img src={facebookLogo} alt="Facebook" className={styles.contactLogo} />
                            </a>
                          )}
                          {userService.messenger_url && (
                            <a href={userService.messenger_url} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="Messenger">
                              <img src={messengerLogo} alt="Messenger" className={styles.contactLogo} />
                            </a>
                          )}
                          {userService.instagram_url && (
                            <a href={userService.instagram_url} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="Instagram">
                              <img src={instagramLogo} alt="Instagram" className={styles.contactLogo} />
                            </a>
                          )}
                          {userService.tiktok_url && (
                            <a href={userService.tiktok_url} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="TikTok">
                              <img src={tiktokLogo} alt="TikTok" className={styles.contactLogo} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                  {[userService.photo_1_url, userService.photo_2_url, userService.photo_3_url,
                  userService.photo_4_url, userService.photo_5_url, userService.photo_6_url]
                    .filter(Boolean).length > 0 && (
                      <div className={styles.profileField}>
                        <label>Photos:</label>
                        <div className={styles.photoGrid}>
                          {(() => {
                            const photos = [userService.photo_1_url, userService.photo_2_url, userService.photo_3_url,
                            userService.photo_4_url, userService.photo_5_url, userService.photo_6_url].filter(Boolean);
                            return photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Service photo ${index + 1}`}
                                className={styles.servicePhoto}
                                onClick={() => openImageModal(photo, photos)}
                              />
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {businessInside && (
              <Card>
                <CardHeader>
                  <CardTitle>My Business Inside</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.profileField}>
                    <label>Business Name:</label>
                    <span>{businessInside.business_name}</span>
                  </div>

                  <div className={styles.profileField}>
                    <label>Category:</label>
                    <span>{businessInside.category?.name || "N/A"}</span>
                  </div>

                  {businessInside.description && (
                    <div className={styles.profileField}>
                      <label>Description:</label>
                      <RichTextDisplay content={businessInside.description} />
                    </div>
                  )}

                  {(businessInside.block || businessInside.lot) && (
                    <div className={styles.profileField}>
                      <label>Location:</label>
                      <span>
                        {businessInside.block && `Block ${businessInside.block}`}
                        {businessInside.block && businessInside.lot && ", "}
                        {businessInside.lot && `Lot ${businessInside.lot}`}
                      </span>
                    </div>
                  )}

                  {businessInside.availability && (
                    <div className={styles.profileField}>
                      <label>Availability:</label>
                      <span>{businessInside.availability}</span>
                    </div>
                  )}

                  {businessInside.email && (
                    <div className={styles.profileField}>
                      <label>Email:</label>
                      <a href={`mailto:${businessInside.email}`}>
                        {businessInside.email}
                      </a>
                    </div>
                  )}

                  {businessInside.website_url && (
                    <div className={styles.profileField}>
                      <label>Website:</label>
                      <a href={businessInside.website_url} target="_blank" rel="noopener noreferrer">
                        {businessInside.website_url}
                      </a>
                    </div>
                  )}

                  {(businessInside.facebook_url || businessInside.messenger_url || businessInside.viber_number ||
                    businessInside.whatsapp_number || businessInside.tiktok_url || businessInside.instagram_url) && (
                      <div className={styles.profileField}>
                        <label>Contact:</label>
                        <div className={styles.contactLinks}>
                          {businessInside.viber_number && (
                            <a href={businessInside.viber_number} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="Viber">
                              <img src={viberLogo} alt="Viber" className={styles.contactLogo} />
                            </a>
                          )}
                          {businessInside.whatsapp_number && (
                            <a href={businessInside.whatsapp_number} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="WhatsApp">
                              <img src={whatsappLogo} alt="WhatsApp" className={styles.contactLogo} />
                            </a>
                          )}
                          {businessInside.facebook_url && (
                            <a href={businessInside.facebook_url} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="Facebook">
                              <img src={facebookLogo} alt="Facebook" className={styles.contactLogo} />
                            </a>
                          )}
                          {businessInside.messenger_url && (
                            <a href={businessInside.messenger_url} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="Messenger">
                              <img src={messengerLogo} alt="Messenger" className={styles.contactLogo} />
                            </a>
                          )}
                          {businessInside.instagram_url && (
                            <a href={businessInside.instagram_url} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="Instagram">
                              <img src={instagramLogo} alt="Instagram" className={styles.contactLogo} />
                            </a>
                          )}
                          {businessInside.tiktok_url && (
                            <a href={businessInside.tiktok_url} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="TikTok">
                              <img src={tiktokLogo} alt="TikTok" className={styles.contactLogo} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                  {[businessInside.photo_1_url, businessInside.photo_2_url, businessInside.photo_3_url,
                  businessInside.photo_4_url, businessInside.photo_5_url, businessInside.photo_6_url]
                    .filter(Boolean).length > 0 && (
                      <div className={styles.profileField}>
                        <label>Photos:</label>
                        <div className={styles.photoGrid}>
                          {(() => {
                            const photos = [businessInside.photo_1_url, businessInside.photo_2_url, businessInside.photo_3_url,
                            businessInside.photo_4_url, businessInside.photo_5_url, businessInside.photo_6_url].filter(Boolean);
                            return photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Business photo ${index + 1}`}
                                className={styles.servicePhoto}
                                onClick={() => openImageModal(photo, photos)}
                              />
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {businessOutside && (
              <Card>
                <CardHeader>
                  <CardTitle>My Business Outside</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.profileField}>
                    <label>Business Name:</label>
                    <span>{businessOutside.business_name}</span>
                  </div>

                  <div className={styles.profileField}>
                    <label>Category:</label>
                    <span>{businessOutside.category?.name || "N/A"}</span>
                  </div>

                  {businessOutside.description && (
                    <div className={styles.profileField}>
                      <label>Description:</label>
                      <RichTextDisplay content={businessOutside.description} />
                    </div>
                  )}

                  {(businessOutside.address || businessOutside.barangay || businessOutside.city ||
                    businessOutside.province || businessOutside.postal_code) && (
                      <div className={styles.profileField}>
                        <label>Address:</label>
                        <span>
                          {businessOutside.address && `${businessOutside.address}, `}
                          {businessOutside.barangay && `${businessOutside.barangay}, `}
                          {businessOutside.city && `${businessOutside.city}, `}
                          {businessOutside.province && `${businessOutside.province} `}
                          {businessOutside.postal_code}
                        </span>
                      </div>
                    )}

                  {businessOutside.google_maps_link && (
                    <div className={styles.profileField}>
                      <label>Google Maps:</label>
                      <a href={businessOutside.google_maps_link} target="_blank" rel="noopener noreferrer">
                        View on Map
                      </a>
                    </div>
                  )}

                  {businessOutside.hours && (
                    <div className={styles.profileField}>
                      <label>Hours:</label>
                      <span>{businessOutside.hours}</span>
                    </div>
                  )}

                  {businessOutside.phone_number && (
                    <div className={styles.profileField}>
                      <label>Phone:</label>
                      <span>
                        {businessOutside.phone_number}
                        {businessOutside.phone_type && ` (${businessOutside.phone_type})`}
                      </span>
                    </div>
                  )}

                  {businessOutside.email && (
                    <div className={styles.profileField}>
                      <label>Email:</label>
                      <a href={`mailto:${businessOutside.email}`}>
                        {businessOutside.email}
                      </a>
                    </div>
                  )}

                  {businessOutside.website_url && (
                    <div className={styles.profileField}>
                      <label>Website:</label>
                      <a href={businessOutside.website_url} target="_blank" rel="noopener noreferrer">
                        {businessOutside.website_url}
                      </a>
                    </div>
                  )}

                  {businessOutside.facebook_url && (
                    <div className={styles.profileField}>
                      <label>Facebook:</label>
                      <div className={styles.contactLinks}>
                        <a href={businessOutside.facebook_url} target="_blank" rel="noopener noreferrer" className={styles.contactLink} title="Facebook">
                          <img src={facebookLogo} alt="Facebook" className={styles.contactLogo} />
                        </a>
                      </div>
                    </div>
                  )}

                  {[businessOutside.photo_1_url, businessOutside.photo_2_url, businessOutside.photo_3_url,
                  businessOutside.photo_4_url, businessOutside.photo_5_url, businessOutside.photo_6_url]
                    .filter(Boolean).length > 0 && (
                      <div className={styles.profileField}>
                        <label>Photos:</label>
                        <div className={styles.photoGrid}>
                          {(() => {
                            const photos = [businessOutside.photo_1_url, businessOutside.photo_2_url, businessOutside.photo_3_url,
                            businessOutside.photo_4_url, businessOutside.photo_5_url, businessOutside.photo_6_url].filter(Boolean);
                            return photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Business photo ${index + 1}`}
                                className={styles.servicePhoto}
                                onClick={() => openImageModal(photo, photos)}
                              />
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {selectedImage && (
          <div className={styles.imageModalOverlay} onClick={closeImageModal}>
            <div className={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.imageModalClose} onClick={closeImageModal} aria-label="Close">
                <X size={24} />
              </button>
              {imageGallery.length > 1 && (
                <>
                  <button className={`${styles.imageModalNav} ${styles.imageModalPrev}`} onClick={goToPreviousImage} aria-label="Previous image">
                    <ChevronLeft size={32} />
                  </button>
                  <button className={`${styles.imageModalNav} ${styles.imageModalNext}`} onClick={goToNextImage} aria-label="Next image">
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
              <img src={selectedImage} alt="Full size" className={styles.imageModalImg} />
              {imageGallery.length > 1 && (
                <div className={styles.imageModalCounter}>
                  {currentImageIndex + 1} / {imageGallery.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
