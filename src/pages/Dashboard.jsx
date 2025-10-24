import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "../contexts";
import { supabase } from "../utils/supabase";
import Card, { CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import AvatarUploader from "../components/ui/AvatarUploader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Dashboard.css";
import { BeatLoader } from "react-spinners";

// Zod Schemas
const profileSchema = z.object({
    username: z.string().min(1, "Username is required"),
    avatar_url: z.string().optional(),
    occupation: z.string().optional(),
    description: z.string().optional(),
    viber_number: z.string().optional(),
    whatsapp_number: z.string().optional(),
    facebook_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
    messenger_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
    instagram_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
    tiktok_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
});

const serviceSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    price: z.string().optional(),
});

const businessSchema = z.object({
    business_name: z.string().min(1, "Business name is required"),
    description: z.string().optional(),
});

function Dashboard() {
    const { profile, refreshProfile } = useUser();
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Services data
    const [services, setServices] = useState([]);
    const [editingServiceId, setEditingServiceId] = useState(null);

    // Business Inside data
    const [businessInside, setBusinessInside] = useState([]);
    const [editingBusinessInsideId, setEditingBusinessInsideId] = useState(null);

    // Business Outside data
    const [businessOutside, setBusinessOutside] = useState([]);
    const [editingBusinessOutsideId, setEditingBusinessOutsideId] = useState(null);

    // React Hook Form - Profile
    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: "",
            avatar_url: "",
            occupation: "",
            description: "",
            viber_number: "",
            whatsapp_number: "",
            facebook_url: "",
            messenger_url: "",
            instagram_url: "",
            tiktok_url: ""
        }
    });

    // React Hook Form - Service
    const serviceForm = useForm({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            title: "",
            description: "",
            price: ""
        }
    });

    // React Hook Form - Business Inside
    const businessInsideForm = useForm({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            business_name: "",
            description: ""
        }
    });

    // React Hook Form - Business Outside
    const businessOutsideForm = useForm({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            business_name: "",
            description: ""
        }
    });

    // Load profile data
    useEffect(() => {
        if (profile) {
            profileForm.reset({
                username: profile.username || "",
                avatar_url: profile.avatar_url || "",
                occupation: profile.occupation || "",
                description: profile.description || "",
                viber_number: profile.viber_number || "",
                whatsapp_number: profile.whatsapp_number || "",
                facebook_url: profile.facebook_url || "",
                messenger_url: profile.messenger_url || "",
                instagram_url: profile.instagram_url || "",
                tiktok_url: profile.tiktok_url || ""
            });
        }
    }, [profile, profileForm]);

    // Load data based on active tab
    useEffect(() => {
        if (!profile?.id) return;

        const loadData = async () => {
            setLoading(true);
            try {
                if (activeTab === "services") {
                    const { data, error } = await supabase
                        .from("user_services")
                        .select("*")
                        .eq("profile_id", profile.id);
                    if (!error) setServices(data || []);
                } else if (activeTab === "business-inside") {
                    const { data, error } = await supabase
                        .from("user_business_inside")
                        .select("*")
                        .eq("profile_id", profile.id);
                    if (!error) setBusinessInside(data || []);
                } else if (activeTab === "business-outside") {
                    const { data, error } = await supabase
                        .from("user_business_outside")
                        .select("*")
                        .eq("profile_id", profile.id);
                    if (!error) setBusinessOutside(data || []);
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [activeTab, profile?.id]);

    // Save profile
    const handleSaveProfile = async (data) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update(data)
                .eq("id", profile.id);

            if (error) throw error;
            toast.success("Profile updated successfully! ✅", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Error updating profile. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setSaving(false);
        }
    };

    // Service CRUD
    const handleSaveService = async (data) => {
        setSaving(true);
        try {
            if (editingServiceId) {
                const { error } = await supabase
                    .from("user_services")
                    .update(data)
                    .eq("id", editingServiceId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("user_services")
                    .insert([{ ...data, profile_id: profile.id }]);
                if (error) throw error;
            }

            // Reload services
            const { data: servicesData } = await supabase
                .from("user_services")
                .select("*")
                .eq("profile_id", profile.id);
            setServices(servicesData || []);
            serviceForm.reset();
            setEditingServiceId(null);
            toast.success("Service saved successfully! 🎉", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Error saving service:", error);
            toast.error("Error saving service. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEditService = (service) => {
        setEditingServiceId(service.id);
        serviceForm.reset({
            title: service.title,
            description: service.description || "",
            price: service.price || ""
        });
    };

    const handleCancelEditService = () => {
        setEditingServiceId(null);
        serviceForm.reset();
    };

    const handleDeleteService = async (id) => {
        if (!confirm("Delete this service?")) return;
        try {
            const { error } = await supabase
                .from("user_services")
                .delete()
                .eq("id", id);
            if (error) throw error;
            setServices(services.filter(s => s.id !== id));
            toast.success("Service deleted successfully! 🗑️", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("Error deleting service. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    // Business Inside CRUD
    const handleSaveBusinessInside = async (data) => {
        setSaving(true);
        try {
            if (editingBusinessInsideId) {
                const { error } = await supabase
                    .from("user_business_inside")
                    .update(data)
                    .eq("id", editingBusinessInsideId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("user_business_inside")
                    .insert([{ ...data, profile_id: profile.id }]);
                if (error) throw error;
            }

            const { data: businessData } = await supabase
                .from("user_business_inside")
                .select("*")
                .eq("profile_id", profile.id);
            setBusinessInside(businessData || []);
            businessInsideForm.reset();
            setEditingBusinessInsideId(null);
            toast.success("Business saved successfully! 🏢", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Error saving business:", error);
            toast.error("Error saving business. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEditBusinessInside = (business) => {
        setEditingBusinessInsideId(business.id);
        businessInsideForm.reset({
            business_name: business.business_name,
            description: business.description || ""
        });
    };

    const handleCancelEditBusinessInside = () => {
        setEditingBusinessInsideId(null);
        businessInsideForm.reset();
    };

    const handleDeleteBusinessInside = async (id) => {
        if (!confirm("Delete this business?")) return;
        try {
            const { error } = await supabase
                .from("user_business_inside")
                .delete()
                .eq("id", id);
            if (error) throw error;
            setBusinessInside(businessInside.filter(b => b.id !== id));
            toast.success("Business deleted successfully! 🗑️", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Error deleting business:", error);
            toast.error("Error deleting business. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    // Business Outside CRUD
    const handleSaveBusinessOutside = async (data) => {
        setSaving(true);
        try {
            if (editingBusinessOutsideId) {
                const { error } = await supabase
                    .from("user_business_outside")
                    .update(data)
                    .eq("id", editingBusinessOutsideId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("user_business_outside")
                    .insert([{ ...data, profile_id: profile.id }]);
                if (error) throw error;
            }

            const { data: businessData } = await supabase
                .from("user_business_outside")
                .select("*")
                .eq("profile_id", profile.id);
            setBusinessOutside(businessData || []);
            businessOutsideForm.reset();
            setEditingBusinessOutsideId(null);
            toast.success("Business saved successfully! 🏪", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Error saving business:", error);
            toast.error("Error saving business. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEditBusinessOutside = (business) => {
        setEditingBusinessOutsideId(business.id);
        businessOutsideForm.reset({
            business_name: business.business_name,
            description: business.description || ""
        });
    };

    const handleCancelEditBusinessOutside = () => {
        setEditingBusinessOutsideId(null);
        businessOutsideForm.reset();
    };

    const handleDeleteBusinessOutside = async (id) => {
        if (!confirm("Delete this business?")) return;
        try {
            const { error } = await supabase
                .from("user_business_outside")
                .delete()
                .eq("id", id);
            if (error) throw error;
            setBusinessOutside(businessOutside.filter(b => b.id !== id));
            toast.success("Business deleted successfully! 🗑️", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Error deleting business:", error);
            toast.error("Error deleting business. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

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
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={profileForm.handleSubmit(handleSaveProfile)} className="dashboard-form">
                                <div className="dashboard-avatar-section">
                                    <label className="dashboard-avatar-label">Profile Picture</label>
                                    <AvatarUploader
                                        currentAvatar={profileForm.watch("avatar_url")}
                                        userId={profile?.id}
                                        onUploadSuccess={async (url) => {
                                            // Auto-save avatar to database
                                            try {
                                                const { error } = await supabase
                                                    .from("profiles")
                                                    .update({ avatar_url: url })
                                                    .eq("id", profile.id)

                                                if (error) throw error

                                                // Refresh profile in UserContext to update all Avatar components
                                                if (refreshProfile) {
                                                    await refreshProfile()

                                                    // Update form AFTER refreshProfile to get the latest value
                                                    profileForm.setValue("avatar_url", url)
                                                    profileForm.clearErrors("avatar_url")
                                                } else {
                                                    // Fallback: update form directly
                                                    profileForm.setValue("avatar_url", url)
                                                    profileForm.clearErrors("avatar_url")
                                                }

                                                toast.success("Avatar updated successfully! 🎨", {
                                                    position: "top-right",
                                                    autoClose: 3000,
                                                    hideProgressBar: false,
                                                    closeOnClick: true,
                                                    pauseOnHover: true,
                                                    draggable: true,
                                                })
                                            } catch (error) {
                                                console.error("Error auto-saving avatar:", error)
                                                toast.error("Failed to save avatar. Please try again.", {
                                                    position: "top-right",
                                                    autoClose: 5000,
                                                })
                                            }
                                        }}
                                        fallback={profileForm.watch("username") || "U"}
                                        size="large"
                                    />
                                    {profileForm.formState.errors.avatar_url && (
                                        <span className="input-error">{profileForm.formState.errors.avatar_url.message}</span>
                                    )}
                                </div>
                                <Input
                                    label="Username"
                                    type="text"
                                    {...profileForm.register("username")}
                                    error={profileForm.formState.errors.username?.message}
                                />
                                <Input
                                    label="Occupation"
                                    type="text"
                                    {...profileForm.register("occupation")}
                                    error={profileForm.formState.errors.occupation?.message}
                                />
                                <Input
                                    label="Description"
                                    as="textarea"
                                    rows="4"
                                    {...profileForm.register("description")}
                                    error={profileForm.formState.errors.description?.message}
                                />
                                <Input
                                    label="Viber Number"
                                    type="text"
                                    {...profileForm.register("viber_number")}
                                    error={profileForm.formState.errors.viber_number?.message}
                                />
                                <Input
                                    label="WhatsApp Number"
                                    type="text"
                                    {...profileForm.register("whatsapp_number")}
                                    error={profileForm.formState.errors.whatsapp_number?.message}
                                />
                                <Input
                                    label="Facebook URL"
                                    type="url"
                                    {...profileForm.register("facebook_url")}
                                    error={profileForm.formState.errors.facebook_url?.message}
                                />
                                <Input
                                    label="Messenger URL"
                                    type="url"
                                    {...profileForm.register("messenger_url")}
                                    error={profileForm.formState.errors.messenger_url?.message}
                                />
                                <Input
                                    label="Instagram URL"
                                    type="url"
                                    {...profileForm.register("instagram_url")}
                                    error={profileForm.formState.errors.instagram_url?.message}
                                />
                                <Input
                                    label="TikTok URL"
                                    type="url"
                                    {...profileForm.register("tiktok_url")}
                                    error={profileForm.formState.errors.tiktok_url?.message}
                                />
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? <BeatLoader color="#ffffff" size={8} /> : "Save Profile"}
                                </button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {activeTab === "services" && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingServiceId ? "Edit Service" : "Add New Service"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={serviceForm.handleSubmit(handleSaveService)} className="dashboard-form">
                                    <Input
                                        label="Title"
                                        type="text"
                                        {...serviceForm.register("title")}
                                        error={serviceForm.formState.errors.title?.message}
                                    />
                                    <Input
                                        label="Description"
                                        as="textarea"
                                        rows="3"
                                        {...serviceForm.register("description")}
                                        error={serviceForm.formState.errors.description?.message}
                                    />
                                    <Input
                                        label="Price"
                                        type="text"
                                        {...serviceForm.register("price")}
                                        error={serviceForm.formState.errors.price?.message}
                                    />
                                    <div className="form-actions">
                                        <button type="submit" className="btn-primary" disabled={saving}>
                                            {saving ? <BeatLoader color="#ffffff" size={8} /> : editingServiceId ? "Update" : "Add"}
                                        </button>
                                        {editingServiceId && (
                                            <button
                                                type="button"
                                                className="btn-secondary"
                                                onClick={handleCancelEditService}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {loading ? (
                            <div className="loading-container">
                                <BeatLoader color="var(--color-primary)" />
                            </div>
                        ) : (
                            <div className="items-list">
                                {services.map((service) => (
                                    <Card key={service.id} className="item-card">
                                        <CardContent>
                                            <h4>{service.title}</h4>
                                            <p>{service.description}</p>
                                            {service.price && <p className="item-price">Price: {service.price}</p>}
                                            <div className="item-actions">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEditService(service)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteService(service.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {services.length === 0 && (
                                    <p className="empty-message">No services yet. Add your first service above!</p>
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === "business-inside" && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingBusinessInsideId ? "Edit Business" : "Add New Business Inside"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={businessInsideForm.handleSubmit(handleSaveBusinessInside)} className="dashboard-form">
                                    <Input
                                        label="Business Name"
                                        type="text"
                                        {...businessInsideForm.register("business_name")}
                                        error={businessInsideForm.formState.errors.business_name?.message}
                                    />
                                    <Input
                                        label="Description"
                                        as="textarea"
                                        rows="3"
                                        {...businessInsideForm.register("description")}
                                        error={businessInsideForm.formState.errors.description?.message}
                                    />
                                    <div className="form-actions">
                                        <button type="submit" className="btn-primary" disabled={saving}>
                                            {saving ? <BeatLoader color="#ffffff" size={8} /> : editingBusinessInsideId ? "Update" : "Add"}
                                        </button>
                                        {editingBusinessInsideId && (
                                            <button
                                                type="button"
                                                className="btn-secondary"
                                                onClick={handleCancelEditBusinessInside}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {loading ? (
                            <div className="loading-container">
                                <BeatLoader color="var(--color-primary)" />
                            </div>
                        ) : (
                            <div className="items-list">
                                {businessInside.map((business) => (
                                    <Card key={business.id} className="item-card">
                                        <CardContent>
                                            <h4>{business.business_name}</h4>
                                            <p>{business.description}</p>
                                            <div className="item-actions">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEditBusinessInside(business)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteBusinessInside(business.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {businessInside.length === 0 && (
                                    <p className="empty-message">No businesses yet. Add your first business above!</p>
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === "business-outside" && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingBusinessOutsideId ? "Edit Business" : "Add New Business Outside"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={businessOutsideForm.handleSubmit(handleSaveBusinessOutside)} className="dashboard-form">
                                    <Input
                                        label="Business Name"
                                        type="text"
                                        {...businessOutsideForm.register("business_name")}
                                        error={businessOutsideForm.formState.errors.business_name?.message}
                                    />
                                    <Input
                                        label="Description"
                                        as="textarea"
                                        rows="3"
                                        {...businessOutsideForm.register("description")}
                                        error={businessOutsideForm.formState.errors.description?.message}
                                    />
                                    <div className="form-actions">
                                        <button type="submit" className="btn-primary" disabled={saving}>
                                            {saving ? <BeatLoader color="#ffffff" size={8} /> : editingBusinessOutsideId ? "Update" : "Add"}
                                        </button>
                                        {editingBusinessOutsideId && (
                                            <button
                                                type="button"
                                                className="btn-secondary"
                                                onClick={handleCancelEditBusinessOutside}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {loading ? (
                            <div className="loading-container">
                                <BeatLoader color="var(--color-primary)" />
                            </div>
                        ) : (
                            <div className="items-list">
                                {businessOutside.map((business) => (
                                    <Card key={business.id} className="item-card">
                                        <CardContent>
                                            <h4>{business.business_name}</h4>
                                            <p>{business.description}</p>
                                            <div className="item-actions">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEditBusinessOutside(business)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteBusinessOutside(business.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {businessOutside.length === 0 && (
                                    <p className="empty-message">No businesses yet. Add your first business above!</p>
                                )}
                            </div>
                        )}
                    </>
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
