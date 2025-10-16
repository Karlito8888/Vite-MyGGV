import { useState, useEffect } from "react";
import { useAuth } from "../utils/useAuth";
import { usePresence } from "../utils/PresenceContext";
import { getCurrentUserProfile } from "../services/profilesService";
import Avatar from "../components/Avatar";
import "../styles/Profile.css";

function Profile() {
  const { user } = useAuth();
  const { isOnline } = usePresence();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await getCurrentUserProfile();

      if (error) {
         
        console.error("Error loading profile:", error);
        setError(error.message);
      } else {
        setProfile(data);
      }

      setLoading(false);
    }

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="container">
        <div className="text-center mt-6">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="text-center mt-6">
          <h2>Error</h2>
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container">
        <div className="text-center mt-6">
          <h2>Profile Not Found</h2>
          <p>No profile data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="profile-container">
        <h2>My Profile</h2>

        <div className="profile-section">
          <h2>Personal Information</h2>

          <div className="profile-field">
            <label>User ID:</label>
            <span>{profile.id}</span>
          </div>

          <div className="profile-field">
            <label>Full Name:</label>
            <span>{profile.full_name || "Not provided"}</span>
          </div>

          <div className="profile-field">
            <label>Username:</label>
            <span>{profile.username || "Not provided"}</span>
          </div>

          <div className="profile-field">
            <label>Email:</label>
            <span>{profile.email || "Not provided"}</span>
          </div>

          <div className="profile-field">
            <label>Occupation:</label>
            <span>{profile.occupation || "Not provided"}</span>
          </div>

          <div className="profile-field">
            <label>Description:</label>
            <p>{profile.description || "No description provided"}</p>
          </div>
        </div>

        <div className="profile-section">
          <h2>Contact Information</h2>

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
        </div>

        <div className="profile-section">
          <h2>Account Status</h2>

          <div className="profile-field">
            <label>Role:</label>
            <span className={profile.is_admin ? "badge-admin" : "badge-user"}>
              {profile.is_admin ? "Administrator" : "User"}
            </span>
          </div>

          <div className="profile-field">
            <label>Verified:</label>
            <span
              className={
                profile.is_verified ? "badge-verified" : "badge-unverified"
              }
            >
              {profile.is_verified ? "Verified" : "Not Verified"}
            </span>
          </div>

          <div className="profile-field">
            <label>Onboarding Completed:</label>
            <span>{profile.onboarding_completed ? "Yes" : "No"}</span>
          </div>

          <div className="profile-field">
            <label>Account Created:</label>
            <span>
              {new Date(profile.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {profile.last_daily_checkin && (
            <div className="profile-field">
              <label>Last Daily Check-in:</label>
              <span>
                {new Date(profile.last_daily_checkin).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>Avatar</h2>
          <div className="profile-avatar">
            <Avatar
              src={profile.avatar_url}
              alt="Profile avatar"
              size="large"
              fallback={profile.full_name || profile.username || "User"}
              isOnline={isOnline}
            />
          </div>
        </div>

        <div className="profile-section">
          <h2>Coins</h2>
          <div className="profile-field">
            <label>Balance:</label>
            <span className="coins-balance">{profile.coins || 0} coins</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
