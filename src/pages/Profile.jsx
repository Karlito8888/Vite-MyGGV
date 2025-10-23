import { useUser } from "../contexts";
import Avatar from "../components/Avatar";
import Card, { CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import "../styles/Profile.css";

function Profile() {
  const { profile } = useUser();

  // Si pas de profil, afficher un message (pas de loading car géré par ProtectedRoute + UserContext)
  if (!profile) {
    return (
      <div className="container">
        <div className="profile-not-found">
          <h2>Profile Not Found</h2>
          <p>No profile data available. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="profile-container">
        <h2>My Profile</h2>
        
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
            <div className="profile-field">
              <label>Phone Number:</label>
              <span>{profile.phone_number || "Not provided"}</span>
            </div>

            <div className="profile-field">
              <label>Viber Number:</label>
              <span>{profile.viber_number || "Not provided"}</span>
            </div>

            <div className="profile-field">
              <label>Facebook URL:</label>
              {profile.facebook_url ? (
                <a
                  href={profile.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.facebook_url}
                </a>
              ) : (
                <span>Not provided</span>
              )}
            </div>

            <div className="profile-field">
              <label>Messenger URL:</label>
              {profile.messenger_url ? (
                <a
                  href={profile.messenger_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.messenger_url}
                </a>
              ) : (
                <span>Not provided</span>
              )}
            </div>
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
