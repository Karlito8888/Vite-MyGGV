import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
    createBusinessOutside,
    updateBusinessOutside,
    listMyBusinessesOutside,
    deleteBusinessOutside
} from "../../services/userBusinessOutsideService";
import { listBusinessOutsideCategories, createBusinessOutsideCategory } from "../../services/businessOutsideCategoriesService";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";
import Input from "../ui/Input";
import Select from "../ui/Select";
import RichTextEditor from "../ui/RichTextEditor";
import Button from "../ui/Button";
import ImageUploader from "../ui/ImageUploader";
import { toast } from "react-toastify";
import { User } from "lucide-react";
import styles from "./BusinessOutsideManager.module.css";

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

const businessOutsideSchema = z.object({
    business_name: z.string().min(2, "Business name must be at least 2 characters").max(100),
    description: z.string().optional(),
    email: z.union([z.string().email(), z.literal("")]).optional(),
    website_url: z.string().url().or(z.literal("")).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postal_code: z.string().optional(),
    province: z.string().optional(),
    barangay: z.string().optional(),
    google_maps_link: z.string().url().or(z.literal("")).optional(),
    availability: z.string().optional(),
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

function BusinessOutsideManager({ profileId }) {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [existingBusiness, setExistingBusiness] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const form = useForm({
        resolver: zodResolver(businessOutsideSchema),
        defaultValues: {
            business_name: "",
            description: "",
            email: "",
            website_url: "",
            address: "",
            city: "",
            postal_code: "",
            province: "",
            barangay: "",
            google_maps_link: "",
            availability: "",
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
            const { data: categoriesData, error: categoriesError } = await listBusinessOutsideCategories();
            if (!categoriesError && categoriesData) {
                setCategories(categoriesData);
            } else if (categoriesError) {
                console.error("Error loading categories:", categoriesError);
            }

            // Load existing business
            const { data: businessesData, error: businessError } = await listMyBusinessesOutside(profileId);
            if (!businessError && businessesData && businessesData.length > 0) {
                const businessData = businessesData[0]; // Get the first business
                setExistingBusiness(businessData);
                setSelectedCategory(businessData.category_id);

                // Load photos
                const existingPhotos = [
                    businessData.photo_1_url,
                    businessData.photo_2_url,
                    businessData.photo_3_url,
                    businessData.photo_4_url,
                    businessData.photo_5_url,
                    businessData.photo_6_url
                ].filter(Boolean);
                setPhotos(existingPhotos);

                form.reset({
                    business_name: businessData.business_name || "",
                    description: businessData.description || "",
                    email: businessData.email || "",
                    website_url: businessData.website_url || "",
                    address: businessData.address || "",
                    city: businessData.city || "",
                    postal_code: businessData.postal_code || "",
                    province: businessData.province || "",
                    barangay: businessData.barangay || "",
                    google_maps_link: businessData.google_maps_link || "",
                    availability: businessData.availability || "",
                    viber_number: extractPhoneFromUrl(businessData.viber_number, "viber"),
                    whatsapp_number: extractPhoneFromUrl(businessData.whatsapp_number, "whatsapp"),
                    facebook_url: businessData.facebook_url || "",
                    messenger_url: businessData.messenger_url || "",
                    instagram_url: businessData.instagram_url || "",
                    tiktok_url: businessData.tiktok_url || ""
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
        const result = await createBusinessOutsideCategory({ name: newCategoryName.trim() });

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
        try {
            const normalizedData = {
                ...data,
                viber_number: normalizeSocialUrl(data.viber_number, "viber"),
                whatsapp_number: normalizeSocialUrl(data.whatsapp_number, "whatsapp"),
                facebook_url: normalizeSocialUrl(data.facebook_url, "facebook"),
                messenger_url: normalizeSocialUrl(data.messenger_url, "messenger"),
                instagram_url: normalizeSocialUrl(data.instagram_url, "instagram"),
                tiktok_url: normalizeSocialUrl(data.tiktok_url, "tiktok"),
            };
            const businessData = {
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
            if (existingBusiness) {
                result = await updateBusinessOutside(existingBusiness.id, businessData);
            } else {
                result = await createBusinessOutside(businessData);
            }

            if (result.error) throw result.error;

            if (!existingBusiness && result.data) {
                setExistingBusiness(result.data);
            }

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

    const handleDelete = async () => {
        if (!existingBusiness) return;

        setDeleting(true);
        try {
            const result = await deleteBusinessOutside(existingBusiness.id);

            if (result.error) throw result.error;

            toast.success("Business deleted successfully! 🗑️", {
                position: "top-right",
                autoClose: 3000,
            });

            // Reset form and state
            setExistingBusiness(null);
            setSelectedCategory("");
            setPhotos([]);
            form.reset();
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting business:", error);
            toast.error("Error deleting business. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
        <Card>
            <CardHeader>
                <div className={styles.cardHeaderContainer}>
                    <CardTitle>My Business Outside</CardTitle>
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
                <form
                    onSubmit={form.handleSubmit(handleSave)}
                    className={styles.dashboardForm}
                >
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <Select
                            id="business-outside-category"
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
                    <Input
                        label="Business Name"
                        type="text"
                        required
                        {...form.register("business_name")}
                        error={form.formState.errors.business_name?.message}
                    />
                    <Controller
                        name="description"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <RichTextEditor
                                label="Description"
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                placeholder="Describe your business..."
                            />
                        )}
                    />
                    <Input
                        label="Availability"
                        type="text"
                        placeholder="e.g., Mon-Fri 9AM-5PM"
                        {...form.register("availability")}
                        error={form.formState.errors.availability?.message}
                    />
                    <Input
                        label="Email"
                        type="email"
                        {...form.register("email")}
                        error={form.formState.errors.email?.message}
                    />
                    <Input
                        label="Website URL"
                        type="url"
                        {...form.register("website_url")}
                        error={form.formState.errors.website_url?.message}
                    />
                    <Input
                        label="Address"
                        type="text"
                        {...form.register("address")}
                        error={form.formState.errors.address?.message}
                    />
                    <Input
                        label="Barangay"
                        type="text"
                        {...form.register("barangay")}
                        error={form.formState.errors.barangay?.message}
                    />
                    <Input
                        label="City"
                        type="text"
                        {...form.register("city")}
                        error={form.formState.errors.city?.message}
                    />
                    <Input
                        label="Province"
                        type="text"
                        {...form.register("province")}
                        error={form.formState.errors.province?.message}
                    />
                    <Input
                        label="Postal Code"
                        type="text"
                        {...form.register("postal_code")}
                        error={form.formState.errors.postal_code?.message}
                    />
                    <Input
                        label="Google Maps Link"
                        type="url"
                        {...form.register("google_maps_link")}
                        error={form.formState.errors.google_maps_link?.message}
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
                        bucket="business-outside-photos"
                        folder="uploads"
                    />
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={saving}
                            disabled={saving}
                            style={{ flex: 1 }}
                        >
                            Save Business
                        </Button>
                        {existingBusiness && (
                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => setShowDeleteModal(true)}
                                disabled={saving || deleting}
                                style={{ flex: 1 }}
                            >
                                Delete Business
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>

        {showNewCategoryModal && (
            <div
                className="modal-overlay"
                onClick={() => setShowNewCategoryModal(false)}
            >
                <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3>Create New Category</h3>
                    <Input
                        label="Category Name"
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter category name"
                        autoFocus
                    />
                    <div
                        style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
                    >
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

        {showDeleteModal && (
            <div
                className="modal-overlay"
                onClick={() => setShowDeleteModal(false)}
            >
                <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3>Delete Business</h3>
                    <p>Are you sure you want to delete this business? This action cannot be undone.</p>
                    <div
                        style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
                    >
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            loading={deleting}
                            disabled={deleting}
                        >
                            Delete
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

export default BusinessOutsideManager;
