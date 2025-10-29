import { useState } from "react";
import { useUser } from "../contexts";
import { ProfileForm, ServicesManager, BusinessInsideManager, BusinessOutsideManager } from "../components/dashboard";
import styles from "../styles/Dashboard.module.css";

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

                <div className={styles.dashboardTabs}>
                    <button
                        className={`${styles.tabButton} ${activeTab === "profile" ? styles.active : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        Profile
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === "services" ? styles.active : ""}`}
                        onClick={() => setActiveTab("services")}
                    >
                        Services
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === "business-inside" ? styles.active : ""}`}
                        onClick={() => setActiveTab("business-inside")}
                    >
                        Business Inside
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === "business-outside" ? styles.active : ""}`}
                        onClick={() => setActiveTab("business-outside")}
                    >
                        Business Outside
                    </button>
                </div>

                <div className={styles.tabContent}>
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
