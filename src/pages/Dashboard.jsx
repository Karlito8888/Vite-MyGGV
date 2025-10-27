import { useState } from "react";
import { useUser } from "../contexts";
import { ProfileForm, ServicesManager, BusinessInsideManager, BusinessOutsideManager } from "../components/dashboard";
import "../styles/Dashboard.css";

function Dashboard() {
    const { profile, refreshProfile } = useUser();
    const [activeTab, setActiveTab] = useState("profile");

    if (!profile) {
        return (
            <div className="page-container">
                <div className="page-content">
                    <div className="page-not-found">
                        <h2>Dashboard Not Available</h2>
                        <p>Please log in to access your dashboard.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-content">
                <div className="page-header">
                    <h2>My Dashboard</h2>
                </div>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        Profile
                    </button>
                    <button
                        className={`tab-button ${activeTab === "services" ? "active" : ""}`}
                        onClick={() => setActiveTab("services")}
                    >
                        Services
                    </button>
                    <button
                        className={`tab-button ${activeTab === "business-inside" ? "active" : ""}`}
                        onClick={() => setActiveTab("business-inside")}
                    >
                        Business Inside
                    </button>
                    <button
                        className={`tab-button ${activeTab === "business-outside" ? "active" : ""}`}
                        onClick={() => setActiveTab("business-outside")}
                    >
                        Business Outside
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === "profile" && (
                        <ProfileForm profile={profile} refreshProfile={refreshProfile} />
                    )}

                    {activeTab === "services" && (
                        <ServicesManager profileId={profile.id} />
                    )}

                    {activeTab === "business-inside" && (
                        <BusinessInsideManager profileId={profile.id} />
                    )}

                    {activeTab === "business-outside" && (
                        <BusinessOutsideManager profileId={profile.id} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
