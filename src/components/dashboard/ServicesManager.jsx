import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    listMyUserServices,
    createUserService,
    updateUserService,
    deleteUserService
} from "../../services/userServicesService";
import { listServiceCategories } from "../../services/serviceCategoriesService";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";
import Input from "../ui/Input";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";

const serviceSchema = z.object({
    description: z.string().max(1000).optional(),
    price_range: z.string().optional(),
    availability: z.string().optional(),
    service_location_type: z.enum(["at_provider", "mobile", "both"]).optional(),
    block: z.string().optional(),
    lot: z.string().optional(),
    facebook_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
    hours: z.string().optional(),
});

function ServicesManager({ profileId }) {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");

    const form = useForm({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            description: "",
            price_range: "",
            availability: "",
            service_location_type: "",
            block: "",
            lot: "",
            facebook_url: "",
            hours: ""
        }
    });

    const loadServices = async () => {
        setLoading(true);
        const { data, error } = await listMyUserServices(profileId);
        if (!error && data) {
            setServices(data);
        } else if (error) {
            console.error("Error loading services:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        const loadData = async () => {
            // Load categories
            const { data: categoriesData, error: categoriesError } = await listServiceCategories();
            if (!categoriesError && categoriesData) {
                setCategories(categoriesData);
            } else if (categoriesError) {
                console.error("Error loading categories:", categoriesError);
            }

            // Load services
            await loadServices();
        };

        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId]);

    const handleSave = async (data) => {
        if (!selectedCategory) {
            toast.error("Please select a category", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setSaving(true);
        const serviceData = {
            ...data,
            category_id: selectedCategory,
            profile_id: profileId
        };

        let result;
        if (editingId) {
            result = await updateUserService(editingId, serviceData);
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
            await loadServices();
            form.reset();
            setSelectedCategory("");
            setEditingId(null);
            toast.success("Service saved successfully! 🎉", {
                position: "top-right",
                autoClose: 3000,
            });
        }
        setSaving(false);
    };

    const handleEdit = (service) => {
        setEditingId(service.id);
        setSelectedCategory(service.category_id);
        form.reset({
            description: service.description || "",
            price_range: service.price_range || "",
            availability: service.availability || "",
            service_location_type: service.service_location_type || "",
            block: service.block || "",
            lot: service.lot || "",
            facebook_url: service.facebook_url || "",
            hours: service.hours || ""
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setSelectedCategory("");
        form.reset();
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this service?")) return;

        const { error } = await deleteUserService(id);
        if (error) {
            console.error("Error deleting service:", error);
            toast.error("Error deleting service. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        } else {
            setServices(services.filter(s => s.id !== id));
            toast.success("Service deleted successfully! 🗑️", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{editingId ? "Edit Service" : "Add New Service"}</CardTitle>
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
                            label="Description"
                            as="textarea"
                            rows="3"
                            {...form.register("description")}
                            error={form.formState.errors.description?.message}
                        />
                        <Input
                            label="Price Range"
                            type="text"
                            placeholder="e.g., ₱500-₱1000"
                            {...form.register("price_range")}
                            error={form.formState.errors.price_range?.message}
                        />
                        <Input
                            label="Availability"
                            type="text"
                            placeholder="e.g., Mon-Fri, 9AM-5PM"
                            {...form.register("availability")}
                            error={form.formState.errors.availability?.message}
                        />
                        <Input
                            label="Hours"
                            type="text"
                            placeholder="e.g., 24/7, Weekdays only"
                            {...form.register("hours")}
                            error={form.formState.errors.hours?.message}
                        />
                        <div className="form-group">
                            <label>Service Location Type</label>
                            <select {...form.register("service_location_type")} className="form-select">
                                <option value="">Select type</option>
                                <option value="at_provider">At Provider Location</option>
                                <option value="mobile">Mobile (Go to Customer)</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
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
                        <Input
                            label="Facebook URL"
                            type="url"
                            {...form.register("facebook_url")}
                            error={form.formState.errors.facebook_url?.message}
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
                    {services.map((service) => (
                        <Card key={service.id} className="item-card">
                            <CardContent>
                                {service.category && <p className="item-category">Category: {service.category.name}</p>}
                                <p>{service.description}</p>
                                {service.price_range && <p className="item-price">💰 {service.price_range}</p>}
                                {service.availability && <p>📅 {service.availability}</p>}
                                {service.hours && <p>🕒 {service.hours}</p>}
                                {service.service_location_type && (
                                    <p>📍 {service.service_location_type === "at_provider" ? "At Provider" : service.service_location_type === "mobile" ? "Mobile" : "Both"}</p>
                                )}
                                {service.block && service.lot && <p>🏠 Block {service.block}, Lot {service.lot}</p>}
                                <div className="item-actions">
                                    <button className="btn-edit" onClick={() => handleEdit(service)}>
                                        Edit
                                    </button>
                                    <button className="btn-delete" onClick={() => handleDelete(service.id)}>
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
    );
}

export default ServicesManager;
