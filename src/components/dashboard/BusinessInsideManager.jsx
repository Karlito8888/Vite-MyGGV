import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../../utils/supabase";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";
import Input from "../ui/Input";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";

const businessInsideSchema = z.object({
    business_name: z.string().min(2, "Business name must be at least 2 characters").max(100),
    description: z.string().max(1000).optional(),
    email: z.string().email("Invalid email").or(z.literal("")).optional(),
    website_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
    phone_number: z.string().optional(),
    phone_type: z.enum(["landline", "mobile", "viber", "whatsapp"]).optional(),
    hours: z.string().optional(),
    facebook_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
    block: z.string().optional(),
    lot: z.string().optional(),
});

function BusinessInsideManager({ profileId }) {
    const [businesses, setBusinesses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");

    const form = useForm({
        resolver: zodResolver(businessInsideSchema),
        defaultValues: {
            business_name: "",
            description: "",
            email: "",
            website_url: "",
            phone_number: "",
            phone_type: "",
            hours: "",
            facebook_url: "",
            block: "",
            lot: ""
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
                .from("business_inside_categories")
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
                .from("user_business_inside")
                .select("*, category:business_inside_categories(name)")
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
                    .from("user_business_inside")
                    .update(businessData)
                    .eq("id", editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("user_business_inside")
                    .insert([businessData]);
                if (error) throw error;
            }

            await loadBusinesses();
            form.reset();
            setSelectedCategory("");
            setEditingId(null);
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

    const handleEdit = (business) => {
        setEditingId(business.id);
        setSelectedCategory(business.category_id);
        form.reset({
            business_name: business.business_name,
            description: business.description || "",
            email: business.email || "",
            website_url: business.website_url || "",
            phone_number: business.phone_number || "",
            phone_type: business.phone_type || "",
            hours: business.hours || "",
            facebook_url: business.facebook_url || "",
            block: business.block || "",
            lot: business.lot || ""
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
                .from("user_business_inside")
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
                    <CardTitle>{editingId ? "Edit Business Inside" : "Add New Business Inside"}</CardTitle>
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
                            label="Phone Number"
                            type="text"
                            {...form.register("phone_number")}
                            error={form.formState.errors.phone_number?.message}
                        />
                        <div className="form-group">
                            <label>Phone Type</label>
                            <select {...form.register("phone_type")} className="form-select">
                                <option value="">Select type</option>
                                <option value="landline">Landline</option>
                                <option value="mobile">Mobile</option>
                                <option value="viber">Viber</option>
                                <option value="whatsapp">WhatsApp</option>
                            </select>
                        </div>
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
                        <Input
                            label="Block"
                            type="text"
                            {...form.register("block")}
                            error={form.formState.errors.block?.message}
                        />
                        <Input
                            label="Lot"
                            type="text"
                            {...form.register("lot")}
                            error={form.formState.errors.lot?.message}
                        />
                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? <BeatLoader color="#ffffff" size={8} /> : editingId ? "Update" : "Add"}
                            </button>
                            {editingId && (
                                <button type="button" className="btn-secondary" onClick={handleCancel}>
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
                    {businesses.map((business) => (
                        <Card key={business.id} className="item-card">
                            <CardContent>
                                <h4>{business.business_name}</h4>
                                {business.category && <p className="item-category">Category: {business.category.name}</p>}
                                <p>{business.description}</p>
                                {business.phone_number && <p>📞 {business.phone_number} {business.phone_type && `(${business.phone_type})`}</p>}
                                {business.email && <p>✉️ {business.email}</p>}
                                {business.hours && <p>🕒 {business.hours}</p>}
                                {business.block && business.lot && <p>📍 Block {business.block}, Lot {business.lot}</p>}
                                <div className="item-actions">
                                    <button className="btn-edit" onClick={() => handleEdit(business)}>
                                        Edit
                                    </button>
                                    <button className="btn-delete" onClick={() => handleDelete(business.id)}>
                                        Delete
                                    </button>
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

export default BusinessInsideManager;
