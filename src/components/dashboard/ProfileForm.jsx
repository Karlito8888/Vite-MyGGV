import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../../utils/supabase";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import AvatarUploader from "../ui/AvatarUploader";
import { toast } from "react-toastify";

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

function ProfileForm({ profile, refreshProfile }) {
    const [saving, setSaving] = useState(false);

    const form = useForm({
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

    useEffect(() => {
        if (profile) {
            form.reset({
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
    }, [profile, form]);

    const handleSave = async (data) => {
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

    const handleAvatarUpload = async (url) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ avatar_url: url })
                .eq("id", profile.id);

            if (error) throw error;

            if (refreshProfile) {
                await refreshProfile();
                form.setValue("avatar_url", url);
                form.clearErrors("avatar_url");
            } else {
                form.setValue("avatar_url", url);
                form.clearErrors("avatar_url");
            }

            toast.success("Avatar updated successfully! 🎨", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Error auto-saving avatar:", error);
            toast.error("Failed to save avatar. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(handleSave)} className="dashboard-form">
                    <div className="dashboard-avatar-section">
                        <label className="dashboard-avatar-label">Profile Picture</label>
                        <AvatarUploader
                            currentAvatar={form.watch("avatar_url")}
                            userId={profile?.id}
                            onUploadSuccess={handleAvatarUpload}
                            fallback={form.watch("username") || "U"}
                            size="large"
                        />
                        {form.formState.errors.avatar_url && (
                            <span className="input-error">{form.formState.errors.avatar_url.message}</span>
                        )}
                    </div>
                    <Input
                        label="Username"
                        type="text"
                        {...form.register("username")}
                        error={form.formState.errors.username?.message}
                    />
                    <Input
                        label="Occupation"
                        type="text"
                        {...form.register("occupation")}
                        error={form.formState.errors.occupation?.message}
                    />
                    <Input
                        label="Description"
                        as="textarea"
                        rows="4"
                        {...form.register("description")}
                        error={form.formState.errors.description?.message}
                    />
                    <Input
                        label="Viber Number"
                        type="text"
                        {...form.register("viber_number")}
                        error={form.formState.errors.viber_number?.message}
                    />
                    <Input
                        label="WhatsApp Number"
                        type="text"
                        {...form.register("whatsapp_number")}
                        error={form.formState.errors.whatsapp_number?.message}
                    />
                    <Input
                        label="Facebook URL"
                        type="url"
                        {...form.register("facebook_url")}
                        error={form.formState.errors.facebook_url?.message}
                    />
                    <Input
                        label="Messenger URL"
                        type="url"
                        {...form.register("messenger_url")}
                        error={form.formState.errors.messenger_url?.message}
                    />
                    <Input
                        label="Instagram URL"
                        type="url"
                        {...form.register("instagram_url")}
                        error={form.formState.errors.instagram_url?.message}
                    />
                    <Input
                        label="TikTok URL"
                        type="url"
                        {...form.register("tiktok_url")}
                        error={form.formState.errors.tiktok_url?.message}
                    />
                    <Button type="submit" variant="primary" loading={saving} disabled={saving}>
                        Save Profile
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default ProfileForm;
