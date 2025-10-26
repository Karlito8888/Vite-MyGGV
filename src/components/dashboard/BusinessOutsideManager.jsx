import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../../utils/supabase";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { toast } from "react-toastify";

const businessOutsideSchema = z.object({
    business_name: z.string().min(2, "Business name must be at least 2 characters").max(100),
    description: z.string().max(1000).optional(),
    phone_number: z.string().optional(),
    phone_type: z.string().optional(),
    email: z.string().email("Invalid email").or(z.literal("")).optional(),
    website_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postal_code: z.string().optional(),
    province: z.string().optional(),
    barangay: z.string().optional(),
    google_maps_link: z.string().url("Invalid URL").or(z.literal("")).optional(),
    hours: z.string().optional(),
    facebook_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
});

function BusinessOutsideManager({ profileId }) {
    const [businesses, setBusinesses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");

    const form = useForm({
        resolver: zodResolver(businessOutsideSchema),
        defaultValues: {
            business_name: "",
            description: "",
            phone_number: "",
            phone_type: "",
            email: "",
            website_url: "",
            address: "",
            city: "",
            postal_code: "",
            province: "",
            barangay: "",
            google_maps_link: "",
            hours: "",
            facebook_url: ""
        }
    });

    useEffect(() => {
        loadBusinesses();
        loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId]);

    const loadCategories = async () => {
        try {
            const { data, error } = await supabase
                .from("business_outside_categories")
                .select("*")
                .eq("is_active", true)
                .order("name");
            if (!error) setCategories(data || []);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const loadBusinesses = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("user_business_outside")
                .select("*, category:business_outside_categories(name)")
                .eq("profile_id", profileId);
            if (!error) setBusinesses(data || []);
        } catch (error) {
            console.error("Error loading businesses:", error);
        } finally {
            setLoading(false);
        }
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
            const businessData = {
                ...data,
                category_id: selectedCategory,
                profile_id: profileId
            };

            if (editingId) {
                const { error } = await supabase
                    .from("user_business_outside")
                    .update(businessData)
                    .eq("id", editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("user_business_outside")
                    .insert([businessData]);
                if (error) throw error;
            }

            await loadBusinesses();
            form.reset();
            setSelectedCategory("");
            setEditingId(null);
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

    const handleEdit = (business) => {
        setEditingId(business.id);
        setSelectedCategory(business.category_id);
        form.reset({
            business_name: business.business_name,
            description: business.description || "",
            phone_number: business.phone_number || "",
            phone_type: business.phone_type || "",
            email: business.email || "",
            website_url: business.website_url || "",
            address: business.address || "",
            city: business.city || "",
            postal_code: business.postal_code || "",
            province: business.province || "",
            barangay: business.barangay || "",
            google_maps_link: business.google_maps_link || "",
            hours: business.hours || "",
            facebook_url: business.facebook_url || ""
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setSelectedCategory("");
        form.reset();
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this business?")) return;
        try {
            const { error } = await supabase
                .from("user_business_outside")
                .delete()
                .eq("id", id);
            if (error) throw error;
            setBusinesses(businesses.filter(b => b.id !== id));
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

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{editingId ? "Edit Business Outside" : "Add New Business Outside"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(handleSave)} className="dashboard-form">
                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="form-select"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Business Name *"
                            type="text"
                            {...form.register("business_name")}
                            error={form.formState.errors.business_name?.message}
                        />
                        <Input
                            label="Description"
                            as="textarea"
                            rows="3"
                            {...form.register("description")}
                            error={form.formState.errors.description?.message}
                        />
                        <Input
                            label="Phone Number"
                            type="text"
                            {...form.register("phone_number")}
                            error={form.formState.errors.phone_number?.message}
                        />
                        <Input
                            label="Phone Type"
                            type="text"
                            placeholder="e.g., Mobile, Landline"
                            {...form.register("phone_type")}
                            error={form.formState.errors.phone_type?.message}
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
                            label="Hours"
                            type="text"
                            placeholder="e.g., Mon-Fri 9AM-5PM"
                            {...form.register("hours")}
                            error={form.formState.errors.hours?.message}
                        />
                        <Input
                            label="Facebook URL"
                            type="url"
                            {...form.register("facebook_url")}
                            error={form.formState.errors.facebook_url?.message}
                        />
                        <div className="form-actions">
                            <Button type="submit" variant="primary" loading={saving} disabled={saving}>
                                {editingId ? "Update" : "Add"}
                            </Button>
                            {editingId && (
                                <Button type="button" variant="secondary" onClick={handleCancel}>
                                    Cancel
                                </Button>
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
                    {businesses.map((business) => (
                        <Card key={business.id} className="item-card">
                            <CardContent>
                                <h4>{business.business_name}</h4>
                                {business.category && <p className="item-category">Category: {business.category.name}</p>}
                                <p>{business.description}</p>
                                {business.phone_number && <p>📞 {business.phone_number} {business.phone_type && `(${business.phone_type})`}</p>}
                                {business.email && <p>✉️ {business.email}</p>}
                                {business.hours && <p>🕒 {business.hours}</p>}
                                {business.address && (
                                    <p>📍 {business.address}
                                        {business.barangay && `, ${business.barangay}`}
                                        {business.city && `, ${business.city}`}
                                        {business.province && `, ${business.province}`}
                                        {business.postal_code && ` ${business.postal_code}`}
                                    </p>
                                )}
                                <div className="item-actions">
                                    <Button className="btn-edit" onClick={() => handleEdit(business)}>
                                        Edit
                                    </Button>
                                    <Button className="btn-delete" onClick={() => handleDelete(business.id)}>
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {businesses.length === 0 && (
                        <p className="empty-message">No businesses yet. Add your first business above!</p>
                    )}
                </div>
            )}
        </>
    );
}

export default BusinessOutsideManager;
