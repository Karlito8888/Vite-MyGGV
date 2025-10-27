import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { createUserService, updateUserService, listMyUserServices } from "../../services/userServicesService";
import { listServiceCategories, createServiceCategory } from "../../services/serviceCategoriesService";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";
import Input from "../ui/Input";
import Select from "../ui/Select";
import RichTextEditor from "../ui/RichTextEditor";
import Button from "../ui/Button";
import ImageUploader from "../ui/ImageUploader";
import { toast } from "react-toastify";
import { User } from "lucide-react";

// Helper to normalize phone numbers
const normalizePhoneNumber = (value) => {
    if (!value || value.trim() === "") return "";
    const cleaned = value.trim().replace(/[\s\-()]/g, "");
    return cleaned;
};

// Helper to extract phone number from Viber/WhatsApp link
const extractPhoneFromUrl = (value, platform) => {
    if (!value || value.trim() === "") return "";
    const trimmed = value.trim();
    if (!trimmed.startsWith("http") && !trimmed.startsWith("viber://")) {
        return trimmed;
    }
    if (platform === "viber" && trimmed.includes("viber://chat?number=")) {
        const match = trimmed.match(/number=([^&]+)/);
        if (match) {
            return decodeURIComponent(match[1]);
        }
    }
    if (platform === "whatsapp" && trimmed.includes("wa.me/")) {
        const match = trimmed.match(/wa\.me\/(\+?\d+)/);
        if (match) {
            return match[1].startsWith("+") ? match[1] : `+${match[1]}`;
        }
    }
    return trimmed;
};

// Helper to normalize social media URLs
const normalizeSocialUrl = (value, platform) => {
    if (!value || value.trim() === "") return "";
    const trimmed = value.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("viber://")) {
        return trimmed;
    }
    switch (platform) {
        case "facebook":
            return `https://facebook.com/${trimmed.replace(/^@/, "")}`;
        case "messenger":
            return `https://m.me/${trimmed.replace(/^@/, "")}`;
        case "instagram":
            return `https://instagram.com/${trimmed.replace(/^@/, "")}`;
        case "tiktok":
            return `https://tiktok.com/@${trimmed.replace(/^@/, "")}`;
        case "whatsapp": {
            const phone = normalizePhoneNumber(trimmed);
            return `https://wa.me/${phone.replace(/^\+/, "")}`;
        }
        case "viber": {
            const viberPhone = normalizePhoneNumber(trimmed);
            const encodedPhone = encodeURIComponent(viberPhone.startsWith("+") ? viberPhone : `+${viberPhone}`);
            return `viber://chat?number=${encodedPhone}`;
        }
        default:
            return trimmed;
    }
};

const serviceSchema = z.object({
    description: z.string().optional(),
    price_range: z.string().optional(),
    availability: z.string().optional(),
    service_location_type: z.enum(["at_provider", "mobile", "both"]).optional(),
    viber_number: z.string()
        .optional()
        .refine((val) => {
            if (!val || val.trim() === "") return true;
            const cleaned = val.replace(/[\s\-()]/g, "");
            return /^\+?\d{10,15}$/.test(cleaned);
        }, "Must include country code (e.g., +639171234567)"),
    whatsapp_number: z.string()
        .optional()
        .refine((val) => {
            if (!val || val.trim() === "") return true;
            const cleaned = val.replace(/[\s\-()]/g, "");
            return /^\+?\d{10,15}$/.test(cleaned);
        }, "Must include country code (e.g., +639171234567)"),
    facebook_url: z.string().optional().transform((val) => val === "" ? "" : val),
    messenger_url: z.string().optional().transform((val) => val === "" ? "" : val),
    instagram_url: z.string().optional().transform((val) => val === "" ? "" : val),
    tiktok_url: z.string().optional().transform((val) => val === "" ? "" : val),
});

function ServicesManager({ profileId }) {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [existingService, setExistingService] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [creatingCategory, setCreatingCategory] = useState(false);

    const form = useForm({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            description: "",
            price_range: "",
            availability: "",
            service_location_type: "",
            facebook_url: "",
            messenger_url: "",
            viber_number: "",
            whatsapp_number: "",
            tiktok_url: "",
            instagram_url: ""
        }
    });

    useEffect(() => {
        const loadData = async () => {
            // Load categories
            const { data: categoriesData, error: categoriesError } = await listServiceCategories();
            if (!categoriesError && categoriesData) {
                setCategories(categoriesData);
            } else if (categoriesError) {
                console.error("Error loading categories:", categoriesError);
            }

            // Load existing service
            const { data: servicesData, error: servicesError } = await listMyUserServices(profileId);
            if (!servicesError && servicesData && servicesData.length > 0) {
                const service = servicesData[0]; // Get the first service
                setExistingService(service);
                setSelectedCategory(service.category_id);

                // Load photos
                const existingPhotos = [
                    service.photo_1_url,
                    service.photo_2_url,
                    service.photo_3_url,
                    service.photo_4_url,
                    service.photo_5_url,
                    service.photo_6_url
                ].filter(Boolean);
                setPhotos(existingPhotos);

                form.reset({
                    description: service.description || "",
                    price_range: service.price_range || "",
                    availability: service.availability || "",
                    service_location_type: service.service_location_type || "",
                    viber_number: extractPhoneFromUrl(service.viber_number, "viber"),
                    whatsapp_number: extractPhoneFromUrl(service.whatsapp_number, "whatsapp"),
                    facebook_url: service.facebook_url || "",
                    messenger_url: service.messenger_url || "",
                    instagram_url: service.instagram_url || "",
                    tiktok_url: service.tiktok_url || ""
                });
            }
        };

        loadData();
    }, [profileId, form]);

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error("Please enter a category name", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setCreatingCategory(true);
        const result = await createServiceCategory({ name: newCategoryName.trim() });

        if (result.error) {
            console.error("Error creating category:", result.error);
            toast.error("Error creating category. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        } else {
            setCategories([...categories, result.data]);
            setSelectedCategory(result.data.id);
            setNewCategoryName("");
            setShowNewCategoryModal(false);
            toast.success("Category created successfully! ✨", {
                position: "top-right",
                autoClose: 3000,
            });
        }
        setCreatingCategory(false);
    };

    const handleSave = async (data) => {
        if (!selectedCategory) {
            toast.error("Please select a category", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setSaving(true);
        const normalizedData = {
            ...data,
            viber_number: normalizeSocialUrl(data.viber_number, "viber"),
            whatsapp_number: normalizeSocialUrl(data.whatsapp_number, "whatsapp"),
            facebook_url: normalizeSocialUrl(data.facebook_url, "facebook"),
            messenger_url: normalizeSocialUrl(data.messenger_url, "messenger"),
            instagram_url: normalizeSocialUrl(data.instagram_url, "instagram"),
            tiktok_url: normalizeSocialUrl(data.tiktok_url, "tiktok"),
        };
        const serviceData = {
            ...normalizedData,
            category_id: selectedCategory,
            profile_id: profileId,
            photo_1_url: photos[0] || null,
            photo_2_url: photos[1] || null,
            photo_3_url: photos[2] || null,
            photo_4_url: photos[3] || null,
            photo_5_url: photos[4] || null,
            photo_6_url: photos[5] || null
        };

        let result;
        if (existingService) {
            result = await updateUserService(existingService.id, serviceData);
        } else {
            result = await createUserService(serviceData);
        }

        if (result.error) {
            console.error("Error saving service:", result.error);
            toast.error("Error saving service. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        } else {
            if (!existingService) {
                setExistingService(result.data);
            }
            toast.success("Service saved successfully! 🎉", {
                position: "top-right",
                autoClose: 3000,
            });
        }
        setSaving(false);
    };

    return (
        <Card>
            <CardHeader>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <CardTitle>My Services</CardTitle>
                    <Button
                        className="btn-dashboard"
                        onClick={() => navigate("/profile")}
                        aria-label="Go to Profile"
                        type="button"
                    >
                        <User size={20} />
                        View Profile
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(handleSave)} className="dashboard-form">
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <Select
                            id="service-category"
                            name="category"
                            label="Category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                            placeholder="Select a category"
                            required
                            helperText="Don't see your category? Create a new one! 🎯"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowNewCategoryModal(true)}
                            style={{ whiteSpace: "nowrap", minHeight: "48px" }}
                        >
                            + New
                        </Button>
                    </div>
                    <Controller
                        name="description"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <RichTextEditor
                                label="Description"
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                placeholder="Describe your service..."
                            />
                        )}
                    />
                    <Input
                        label="Availability"
                        type="text"
                        placeholder="e.g., Mon-Fri, 9AM-5PM"
                        {...form.register("availability")}
                        error={form.formState.errors.availability?.message}
                    />
                    <Input
                        label="Price Range"
                        type="text"
                        placeholder="e.g., ₱500-₱1000"
                        {...form.register("price_range")}
                        error={form.formState.errors.price_range?.message}
                    />
                    <Select
                        id="service-location-type"
                        label="Service Location Type"
                        {...form.register("service_location_type")}
                        options={[
                            { value: "at_provider", label: "My Location" },
                            { value: "mobile", label: "Your Location" },
                            { value: "both", label: "Both" }
                        ]}
                        placeholder="Select type"
                    />
                    <Input
                        label="Viber Number"
                        type="tel"
                        placeholder="+639171234567"
                        {...form.register("viber_number")}
                        error={form.formState.errors.viber_number?.message}
                        helperText={<>Must include country code<br />Example: +63 917 123 4567 (Philippines)</>}
                    />
                    <Input
                        label="WhatsApp Number"
                        type="tel"
                        placeholder="+639171234567"
                        {...form.register("whatsapp_number")}
                        error={form.formState.errors.whatsapp_number?.message}
                        helperText={<>Must include country code<br />Example: +63 917 123 4567 (Philippines)</>}
                    />
                    <Input
                        label="Facebook URL"
                        type="text"
                        placeholder="username or https://facebook.com/username"
                        {...form.register("facebook_url")}
                        error={form.formState.errors.facebook_url?.message}
                        helperText={<>📱 Mobile: Share profile → Copy link<br />💻 Desktop: Copy from browser address bar</>}
                    />
                    <Input
                        label="Messenger URL"
                        type="text"
                        placeholder="username or https://m.me/username"
                        {...form.register("messenger_url")}
                        error={form.formState.errors.messenger_url?.message}
                        helperText={<>📱 Mobile: Share profile → Copy link<br />💻 Desktop: Copy from browser address bar</>}
                    />
                    <Input
                        label="Instagram URL"
                        type="text"
                        placeholder="@username or https://instagram.com/username"
                        {...form.register("instagram_url")}
                        error={form.formState.errors.instagram_url?.message}
                        helperText={<>📱 Mobile: Profile → ⋯ → Share → Copy link<br />💻 Desktop: Copy from browser address bar</>}
                    />
                    <Input
                        label="TikTok URL"
                        type="text"
                        placeholder="@username or https://tiktok.com/@username"
                        {...form.register("tiktok_url")}
                        error={form.formState.errors.tiktok_url?.message}
                        helperText={<>📱 Mobile: Profile → Share → Copy link<br />💻 Desktop: Copy from browser address bar</>}
                    />
                    <ImageUploader
                        label="Photos (up to 6)"
                        images={photos}
                        onChange={setPhotos}
                        maxImages={6}
                        bucket="service-photos"
                        folder="uploads"
                    />
                    <Button type="submit" variant="primary" loading={saving} disabled={saving}>
                        Save Service
                    </Button>
                </form>

                {showNewCategoryModal && (
                    <div className="modal-overlay" onClick={() => setShowNewCategoryModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Create New Category</h3>
                            <Input
                                label="Category Name"
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Enter category name"
                                autoFocus
                            />
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleCreateCategory}
                                    loading={creatingCategory}
                                    disabled={creatingCategory}
                                >
                                    Create
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowNewCategoryModal(false)}
                                    disabled={creatingCategory}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default ServicesManager;
