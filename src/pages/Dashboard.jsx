import { useState } from "react";
import { useUser } from "../contexts";
import { ProfileForm, ServicesManager, BusinessInsideManager, BusinessOutsideManager } from "../components/dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Dashboard.css";

function Dashboard() {
    const { profile, refreshProfile } = useUser();
    const [activeTab, setActiveTab] = useState("profile");

    if (!profile) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-not-found">
                    <h2>Dashboard Not Available</h2>
                    <p>Please log in to access your dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <h2>My Dashboard</h2>

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

            <div className="dashboard-content">
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

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
}

export default Dashboard;
