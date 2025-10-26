import { useUser } from "../contexts";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import { LayoutDashboard } from "lucide-react";
import "../styles/Profile.css";
import { BeatLoader } from "react-spinners";
import viberLogo from "../assets/logos/viber.png";
import whatsappLogo from "../assets/logos/whatsapp.png";
import facebookLogo from "../assets/logos/facebook.png";
import messengerLogo from "../assets/logos/messenger.png";
import tiktokLogo from "../assets/logos/tiktok.png";
import instagramLogo from "../assets/logos/instagram.png";

function Profile() {
  const { profile, locationAssociations, profileLoading } = useUser();
  const navigate = useNavigate();

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
        <div className="profile-header">
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
            <div className="profile-avatar">
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
              <div className="profile-field">
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
                <div key={association.id} className="location-association">
                  <div className="profile-field">
                    <label>Block:</label>
                    <span>
                      {association.location?.block || "Not specified"}
                    </span>
                  </div>
                  <div className="profile-field">
                    <label>Lot:</label>
                    <span>{association.location?.lot || "Not specified"}</span>
                  </div>
                  {locationAssociations.length > 1 &&
                    index < locationAssociations.length - 1 && (
                      <hr className="location-divider" />
                    )}
                </div>
              ))
            ) : (
              <div className="profile-field">
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
            <div className="profile-field">
              <label>Username:</label>
              <span>{profile.username || "Not provided"}</span>
            </div>

            <div className="profile-field">
              <label>Occupation:</label>
              <span>{profile.occupation || "Not provided"}</span>
            </div>

            <div className="profile-field">
              <label>Description:</label>
              <p>{profile.description || "No description provided"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="contact-links">
              {profile.viber_number && (
                <a
                  href={`viber://chat?number=${encodeURIComponent(profile.viber_number)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                  title="Contact via Viber"
                >
                  <img src={viberLogo} alt="Viber" className="contact-logo" />
                </a>
              )}

              {profile.whatsapp_number && (
                <a
                  href={`https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                  title="Contact via WhatsApp"
                >
                  <img
                    src={whatsappLogo}
                    alt="WhatsApp"
                    className="contact-logo"
                  />
                </a>
              )}

              {profile.facebook_url && (
                <a
                  href={profile.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                  title="Visit Facebook profile"
                >
                  <img
                    src={facebookLogo}
                    alt="Facebook"
                    className="contact-logo"
                  />
                </a>
              )}

              {profile.messenger_url && (
                <a
                  href={profile.messenger_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                  title="Contact via Messenger"
                >
                  <img
                    src={messengerLogo}
                    alt="Messenger"
                    className="contact-logo"
                  />
                </a>
              )}

              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                  title="Visit Instagram profile"
                >
                  <img
                    src={instagramLogo}
                    alt="Instagram"
                    className="contact-logo"
                  />
                </a>
              )}

              {profile.tiktok_url && (
                <a
                  href={profile.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                  title="Visit TikTok profile"
                >
                  <img
                    src={tiktokLogo}
                    alt="TikTok"
                    className="contact-logo"
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
                <div className="profile-field">
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
            <div className="profile-field">
              <label>Balance:</label>
              <span className="coins-balance">{profile.coins || 0} coins</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Profile;
