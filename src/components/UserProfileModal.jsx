import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Avatar from './Avatar'
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card'
import RichTextDisplay from './ui/RichTextDisplay'
import styles from './UserProfileModal.module.css'
import { supabase } from '../utils/supabase'
import viberLogo from '../assets/logos/viber.png'
import whatsappLogo from '../assets/logos/whatsapp.png'
import facebookLogo from '../assets/logos/facebook.png'
import messengerLogo from '../assets/logos/messenger.png'
import tiktokLogo from '../assets/logos/tiktok.png'
import instagramLogo from '../assets/logos/instagram.png'

function UserProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null)
  const [locationAssociations, setLocationAssociations] = useState([])
  const [userService, setUserService] = useState(null)
  const [businessInside, setBusinessInside] = useState(null)
  const [businessOutside, setBusinessOutside] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageGallery, setImageGallery] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Block body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    const fetchUserData = async () => {
      setLoading(true)
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        setProfile(profileData)

        // Fetch location associations
        const { data: locationsData } = await supabase
          .from('profile_location_associations')
          .select(`
            id,
            location:locations(block, lot)
          `)
          .eq('profile_id', userId)

        setLocationAssociations(locationsData || [])

        // Fetch user service
        const { data: serviceData } = await supabase
          .from('user_services')
          .select(`
            *,
            category:service_categories(name)
          `)
          .eq('profile_id', userId)
          .order('created_at', { ascending: false })

        if (serviceData && serviceData.length > 0) {
          setUserService(serviceData[0])
        }

        // Fetch business inside
        const { data: insideData } = await supabase
          .from('user_business_inside')
          .select(`
            *,
            category:business_inside_categories(name)
          `)
          .eq('profile_id', userId)
          .order('created_at', { ascending: false })

        if (insideData && insideData.length > 0) {
          setBusinessInside(insideData[0])
        }

        // Fetch business outside
        const { data: outsideData } = await supabase
          .from('user_business_outside')
          .select(`
            *,
            category:business_outside_categories(name)
          `)
          .eq('profile_id', userId)
          .order('created_at', { ascending: false })

        if (outsideData && outsideData.length > 0) {
          setBusinessOutside(outsideData[0])
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  const openImageModal = (imageUrl, allImages) => {
    setSelectedImage(imageUrl)
    setImageGallery(allImages)
    setCurrentImageIndex(allImages.indexOf(imageUrl))
  }

  const closeImageModal = () => {
    setSelectedImage(null)
    setImageGallery([])
    setCurrentImageIndex(0)
  }

  const goToPreviousImage = () => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : imageGallery.length - 1
    setCurrentImageIndex(newIndex)
    setSelectedImage(imageGallery[newIndex])
  }

  const goToNextImage = () => {
    const newIndex = currentImageIndex < imageGallery.length - 1 ? currentImageIndex + 1 : 0
    setCurrentImageIndex(newIndex)
    setSelectedImage(imageGallery[newIndex])
  }

  if (!userId) return null

  return createPortal(
    <>
      <div className={styles.userProfileModalOverlay} onClick={onClose}>
        <div className={styles.userProfileModal} onClick={(e) => e.stopPropagation()}>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>

          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <div className={styles.content}>
              {/* Header with Avatar */}
              <div className={styles.header}>
                <Avatar
                  src={profile?.avatar_url}
                  userId={userId}
                  size="large"
                  fallback={profile?.username?.[0] || 'U'}
                  showPresence={true}
                />
                <h2 className={styles.username}>@{profile?.username || 'User'}</h2>
              </div>

              {/* Location Information */}
              {locationAssociations && locationAssociations.length > 0 && (
                <Card className={styles.section}>
                  <CardHeader>
                    <CardTitle>Location Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {locationAssociations.map((association, index) => (
                      <div key={association.id} className="location-association">
                        <div className="profile-field">
                          <label>Block:</label>
                          <span>{association.location?.block || 'Not specified'}</span>
                        </div>
                        <div className="profile-field">
                          <label>Lot:</label>
                          <span>{association.location?.lot || 'Not specified'}</span>
                        </div>
                        {locationAssociations.length > 1 && index < locationAssociations.length - 1 && (
                          <hr className="location-divider" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Personal Information */}
              {(profile?.username || profile?.occupation || profile?.description) && (
                <Card className={styles.section}>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="profile-field">
                      <label>Username:</label>
                      <span>{profile?.username || 'Not provided'}</span>
                    </div>

                    {profile?.occupation && (
                      <div className="profile-field">
                        <label>Occupation:</label>
                        <span>{profile.occupation}</span>
                      </div>
                    )}

                    {profile?.description && (
                      <div className="profile-field">
                        <label>Description:</label>
                        <RichTextDisplay content={profile.description} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              {(profile?.viber_number || profile?.whatsapp_number || profile?.facebook_url ||
                profile?.messenger_url || profile?.instagram_url || profile?.tiktok_url) && (
                  <Card className={styles.section}>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="contact-links">
                        {profile.viber_number && (
                          <a href={profile.viber_number} target="_blank" rel="noopener noreferrer" className="contact-link" title="Contact via Viber">
                            <img src={viberLogo} alt="Viber" className="contact-logo" />
                          </a>
                        )}
                        {profile.whatsapp_number && (
                          <a href={profile.whatsapp_number} target="_blank" rel="noopener noreferrer" className="contact-link" title="Contact via WhatsApp">
                            <img src={whatsappLogo} alt="WhatsApp" className="contact-logo" />
                          </a>
                        )}
                        {profile.facebook_url && (
                          <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="Visit Facebook profile">
                            <img src={facebookLogo} alt="Facebook" className="contact-logo" />
                          </a>
                        )}
                        {profile.messenger_url && (
                          <a href={profile.messenger_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="Contact via Messenger">
                            <img src={messengerLogo} alt="Messenger" className="contact-logo" />
                          </a>
                        )}
                        {profile.instagram_url && (
                          <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="Visit Instagram profile">
                            <img src={instagramLogo} alt="Instagram" className="contact-logo" />
                          </a>
                        )}
                        {profile.tiktok_url && (
                          <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="Visit TikTok profile">
                            <img src={tiktokLogo} alt="TikTok" className="contact-logo" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* User Service */}
              {userService && (
                <Card className={styles.section}>
                  <CardHeader>
                    <CardTitle>Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="profile-field">
                      <label>Category:</label>
                      <span>{userService.category?.name || 'N/A'}</span>
                    </div>

                    {userService.description && (
                      <div className="profile-field">
                        <label>Description:</label>
                        <RichTextDisplay content={userService.description} />
                      </div>
                    )}

                    {userService.price_range && (
                      <div className="profile-field">
                        <label>Price Range:</label>
                        <span>{userService.price_range}</span>
                      </div>
                    )}

                    {userService.availability && (
                      <div className="profile-field">
                        <label>Availability:</label>
                        <span>{userService.availability}</span>
                      </div>
                    )}

                    {userService.service_location_type && (
                      <div className="profile-field">
                        <label>Service Location:</label>
                        <span>
                          {userService.service_location_type === 'at_provider' && 'My Location'}
                          {userService.service_location_type === 'mobile' && 'Your Location'}
                          {userService.service_location_type === 'both' && 'My Location & Your Location'}
                        </span>
                      </div>
                    )}

                    {(userService.facebook_url || userService.messenger_url || userService.viber_number ||
                      userService.whatsapp_number || userService.tiktok_url || userService.instagram_url) && (
                        <div className="profile-field">
                          <label>Contact:</label>
                          <div className="contact-links">
                            {userService.viber_number && (
                              <a href={userService.viber_number} target="_blank" rel="noopener noreferrer" className="contact-link" title="Viber">
                                <img src={viberLogo} alt="Viber" className="contact-logo" />
                              </a>
                            )}
                            {userService.whatsapp_number && (
                              <a href={userService.whatsapp_number} target="_blank" rel="noopener noreferrer" className="contact-link" title="WhatsApp">
                                <img src={whatsappLogo} alt="WhatsApp" className="contact-logo" />
                              </a>
                            )}
                            {userService.facebook_url && (
                              <a href={userService.facebook_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="Facebook">
                                <img src={facebookLogo} alt="Facebook" className="contact-logo" />
                              </a>
                            )}
                            {userService.messenger_url && (
                              <a href={userService.messenger_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="Messenger">
                                <img src={messengerLogo} alt="Messenger" className="contact-logo" />
                              </a>
                            )}
                            {userService.instagram_url && (
                              <a href={userService.instagram_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="Instagram">
                                <img src={instagramLogo} alt="Instagram" className="contact-logo" />
                              </a>
                            )}
                            {userService.tiktok_url && (
                              <a href={userService.tiktok_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="TikTok">
                                <img src={tiktokLogo} alt="TikTok" className="contact-logo" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                    {[userService.photo_1_url, userService.photo_2_url, userService.photo_3_url,
                    userService.photo_4_url, userService.photo_5_url, userService.photo_6_url]
                      .filter(Boolean).length > 0 && (
                        <div className="profile-field">
                          <label>Photos:</label>
                          <div className="photo-grid">
                            {(() => {
                              const photos = [userService.photo_1_url, userService.photo_2_url, userService.photo_3_url,
                              userService.photo_4_url, userService.photo_5_url, userService.photo_6_url].filter(Boolean)
                              return photos.map((photo, index) => (
                                <img
                                  key={index}
                                  src={photo}
                                  alt={`Service photo ${index + 1}`}
                                  className="service-photo"
                                  onClick={() => openImageModal(photo, photos)}
                                />
                              ))
                            })()}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}

              {/* Business Inside */}
              {businessInside && (
                <Card className={styles.section}>
                  <CardHeader>
                    <CardTitle>Business Inside</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="profile-field">
                      <label>Business Name:</label>
                      <span>{businessInside.business_name}</span>
                    </div>

                    <div className="profile-field">
                      <label>Category:</label>
                      <span>{businessInside.category?.name || 'N/A'}</span>
                    </div>

                    {businessInside.description && (
                      <div className="profile-field">
                        <label>Description:</label>
                        <RichTextDisplay content={businessInside.description} />
                      </div>
                    )}

                    {(businessInside.block || businessInside.lot) && (
                      <div className="profile-field">
                        <label>Location:</label>
                        <span>
                          {businessInside.block && `Block ${businessInside.block}`}
                          {businessInside.block && businessInside.lot && ', '}
                          {businessInside.lot && `Lot ${businessInside.lot}`}
                        </span>
                      </div>
                    )}

                    {businessInside.availability && (
                      <div className="profile-field">
                        <label>Availability:</label>
                        <span>{businessInside.availability}</span>
                      </div>
                    )}

                    {businessInside.email && (
                      <div className="profile-field">
                        <label>Email:</label>
                        <a href={`mailto:${businessInside.email}`}>{businessInside.email}</a>
                      </div>
                    )}

                    {businessInside.website_url && (
                      <div className="profile-field">
                        <label>Website:</label>
                        <a href={businessInside.website_url} target="_blank" rel="noopener noreferrer">
                          {businessInside.website_url}
                        </a>
                      </div>
                    )}

                    {(businessInside.facebook_url || businessInside.messenger_url || businessInside.viber_number ||
                      businessInside.whatsapp_number || businessInside.tiktok_url || businessInside.instagram_url) && (
                        <div className="profile-field">
                          <label>Contact:</label>
                          <div className="contact-links">
                            {businessInside.viber_number && (
                              <a href={businessInside.viber_number} target="_blank" rel="noopener noreferrer" className="contact-link" title="Viber">
                                <img src={viberLogo} alt="Viber" className="contact-logo" />
                              </a>
                            )}
                            {businessInside.whatsapp_number && (
                              <a href={businessInside.whatsapp_number} target="_blank" rel="noopener noreferrer" className="contact-link" title="WhatsApp">
                                <img src={whatsappLogo} alt="WhatsApp" className="contact-logo" />
                              </a>
                            )}
                            {businessInside.facebook_url && (
                              <a href={businessInside.facebook_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="Facebook">
                                <img src={facebookLogo} alt="Facebook" className="contact-logo" />
                              </a>
                            )}
                            {businessInside.messenger_url && (
                              <a href={businessInside.messenger_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="Messenger">
                                <img src={messengerLogo} alt="Messenger" className="contact-logo" />
                              </a>
                            )}
                            {businessInside.instagram_url && (
                              <a href={businessInside.instagram_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="Instagram">
                                <img src={instagramLogo} alt="Instagram" className="contact-logo" />
                              </a>
                            )}
                            {businessInside.tiktok_url && (
                              <a href={businessInside.tiktok_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="TikTok">
                                <img src={tiktokLogo} alt="TikTok" className="contact-logo" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                    {[businessInside.photo_1_url, businessInside.photo_2_url, businessInside.photo_3_url,
                    businessInside.photo_4_url, businessInside.photo_5_url, businessInside.photo_6_url]
                      .filter(Boolean).length > 0 && (
                        <div className="profile-field">
                          <label>Photos:</label>
                          <div className="photo-grid">
                            {(() => {
                              const photos = [businessInside.photo_1_url, businessInside.photo_2_url, businessInside.photo_3_url,
                              businessInside.photo_4_url, businessInside.photo_5_url, businessInside.photo_6_url].filter(Boolean)
                              return photos.map((photo, index) => (
                                <img
                                  key={index}
                                  src={photo}
                                  alt={`Business photo ${index + 1}`}
                                  className="service-photo"
                                  onClick={() => openImageModal(photo, photos)}
                                />
                              ))
                            })()}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}

              {/* Business Outside */}
              {businessOutside && (
                <Card className={styles.section}>
                  <CardHeader>
                    <CardTitle>Business Outside</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="profile-field">
                      <label>Business Name:</label>
                      <span>{businessOutside.business_name}</span>
                    </div>

                    <div className="profile-field">
                      <label>Category:</label>
                      <span>{businessOutside.category?.name || 'N/A'}</span>
                    </div>

                    {businessOutside.description && (
                      <div className="profile-field">
                        <label>Description:</label>
                        <RichTextDisplay content={businessOutside.description} />
                      </div>
                    )}

                    {(businessOutside.address || businessOutside.barangay || businessOutside.city ||
                      businessOutside.province || businessOutside.postal_code) && (
                        <div className="profile-field">
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
                      <div className="profile-field">
                        <label>Google Maps:</label>
                        <a href={businessOutside.google_maps_link} target="_blank" rel="noopener noreferrer">
                          View on Map
                        </a>
                      </div>
                    )}

                    {businessOutside.hours && (
                      <div className="profile-field">
                        <label>Hours:</label>
                        <span>{businessOutside.hours}</span>
                      </div>
                    )}

                    {businessOutside.phone_number && (
                      <div className="profile-field">
                        <label>Phone:</label>
                        <span>
                          {businessOutside.phone_number}
                          {businessOutside.phone_type && ` (${businessOutside.phone_type})`}
                        </span>
                      </div>
                    )}

                    {businessOutside.email && (
                      <div className="profile-field">
                        <label>Email:</label>
                        <a href={`mailto:${businessOutside.email}`}>{businessOutside.email}</a>
                      </div>
                    )}

                    {businessOutside.website_url && (
                      <div className="profile-field">
                        <label>Website:</label>
                        <a href={businessOutside.website_url} target="_blank" rel="noopener noreferrer">
                          {businessOutside.website_url}
                        </a>
                      </div>
                    )}

                    {businessOutside.facebook_url && (
                      <div className="profile-field">
                        <label>Facebook:</label>
                        <div className="contact-links">
                          <a href={businessOutside.facebook_url} target="_blank" rel="noopener noreferrer" className="contact-link" title="Facebook">
                            <img src={facebookLogo} alt="Facebook" className="contact-logo" />
                          </a>
                        </div>
                      </div>
                    )}

                    {[businessOutside.photo_1_url, businessOutside.photo_2_url, businessOutside.photo_3_url,
                    businessOutside.photo_4_url, businessOutside.photo_5_url, businessOutside.photo_6_url]
                      .filter(Boolean).length > 0 && (
                        <div className="profile-field">
                          <label>Photos:</label>
                          <div className="photo-grid">
                            {(() => {
                              const photos = [businessOutside.photo_1_url, businessOutside.photo_2_url, businessOutside.photo_3_url,
                              businessOutside.photo_4_url, businessOutside.photo_5_url, businessOutside.photo_6_url].filter(Boolean)
                              return photos.map((photo, index) => (
                                <img
                                  key={index}
                                  src={photo}
                                  alt={`Business photo ${index + 1}`}
                                  className="service-photo"
                                  onClick={() => openImageModal(photo, photos)}
                                />
                              ))
                            })()}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {!loading && !userService && !businessInside && !businessOutside && (
                <div className={styles.empty}>
                  <p>No services or businesses listed yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeImageModal} aria-label="Close">
              <X size={24} />
            </button>
            {imageGallery.length > 1 && (
              <>
                <button className="image-modal-nav image-modal-prev" onClick={goToPreviousImage} aria-label="Previous image">
                  <ChevronLeft size={32} />
                </button>
                <button className="image-modal-nav image-modal-next" onClick={goToNextImage} aria-label="Next image">
                  <ChevronRight size={32} />
                </button>
              </>
            )}
            <img src={selectedImage} alt="Full size" className="image-modal-img" />
            {imageGallery.length > 1 && (
              <div className="image-modal-counter">
                {currentImageIndex + 1} / {imageGallery.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  )
}

export default UserProfileModal
