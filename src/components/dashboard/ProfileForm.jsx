import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../../services/profilesService";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";
import Input from "../ui/Input";
import RichTextEditor from "../ui/RichTextEditor";
import Button from "../ui/Button";
import AvatarUploader from "../ui/AvatarUploader";
import { toast } from "react-toastify";
import { User } from "lucide-react";
import styles from "./ProfileForm.module.css";

// Helper to normalize phone numbers
const normalizePhoneNumber = (value) => {
    if (!value || value.trim() === "") return "";

    // Remove all spaces, dashes, parentheses
    const cleaned = value.trim().replace(/[\s\-()]/g, "");

    // If the number starts with +, keep it
    // Otherwise, assume it's a local number and do nothing
    return cleaned;
};

// Helper to extract phone number from Viber/WhatsApp link
const extractPhoneFromUrl = (value, platform) => {
    if (!value || value.trim() === "") return "";

    const trimmed = value.trim();

    // If it's already a number (not a link), return it
    if (!trimmed.startsWith("http") && !trimmed.startsWith("viber://")) {
        return trimmed;
    }

    // Extract the number according to the platform
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

    // If it's already a valid complete URL, return it
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("viber://")) {
        return trimmed;
    }

    // Otherwise, build the URL according to the platform
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
            // WhatsApp: remove the + and create the wa.me link
            const phone = normalizePhoneNumber(trimmed);
            return `https://wa.me/${phone.replace(/^\+/, "")}`;
        }
        case "viber": {
            // Viber: keep the + and encode for URI
            const viberPhone = normalizePhoneNumber(trimmed);
            const encodedPhone = encodeURIComponent(viberPhone.startsWith("+") ? viberPhone : `+${viberPhone}`);
            return `viber://chat?number=${encodedPhone}`;
        }
        default:
            return trimmed;
    }
};

const profileSchema = z.object({
    username: z.string().min(1, "Username is required"),
    avatar_url: z.string().min(1, "Profile picture is required"),
    occupation: z.string().optional(),
    description: z.string().optional(),
    viber_number: z.string()
        .optional()
        .refine((val) => {
            console.log("🔍 [VALIDATION] Viber validation started", { val });
            const start = performance.now();
            if (!val || val.trim() === "") return true;
            const cleaned = val.replace(/[\s\-()]/g, "");
            const result = /^\+?\d{10,15}$/.test(cleaned);
            console.log("✅ [VALIDATION] Viber validation done", { duration: `${(performance.now() - start).toFixed(2)}ms`, result });
            return result;
        }, "Must include country code (e.g., +639171234567)"),
    whatsapp_number: z.string()
        .optional()
        .refine((val) => {
            console.log("🔍 [VALIDATION] WhatsApp validation started", { val });
            const start = performance.now();
            if (!val || val.trim() === "") return true;
            const cleaned = val.replace(/[\s\-()]/g, "");
            const result = /^\+?\d{10,15}$/.test(cleaned);
            console.log("✅ [VALIDATION] WhatsApp validation done", { duration: `${(performance.now() - start).toFixed(2)}ms`, result });
            return result;
        }, "Must include country code (e.g., +639171234567)"),
    facebook_url: z.string().optional().transform((val) => val === "" ? "" : val),
    messenger_url: z.string().optional().transform((val) => val === "" ? "" : val),
    instagram_url: z.string().optional().transform((val) => val === "" ? "" : val),
    tiktok_url: z.string().optional().transform((val) => val === "" ? "" : val),
});

function ProfileForm({ profile, refreshProfile }) {
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

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
                viber_number: extractPhoneFromUrl(profile.viber_number, "viber"),
                whatsapp_number: extractPhoneFromUrl(profile.whatsapp_number, "whatsapp"),
                facebook_url: profile.facebook_url || "",
                messenger_url: profile.messenger_url || "",
                instagram_url: profile.instagram_url || "",
                tiktok_url: profile.tiktok_url || ""
            });
        }
    }, [profile, form]);

    const handleSave = async (data) => {
        console.log("🚀 [FORM] handleSave started");
        const startTime = performance.now();
        setSaving(true);
        try {
            // Normalize social media URLs and phone numbers
            console.log("🔄 [FORM] Normalizing data...");
            const normalizeStart = performance.now();
            const normalizedData = {
                ...data,
                viber_number: normalizeSocialUrl(data.viber_number, "viber"),
                whatsapp_number: normalizeSocialUrl(data.whatsapp_number, "whatsapp"),
                facebook_url: normalizeSocialUrl(data.facebook_url, "facebook"),
                messenger_url: normalizeSocialUrl(data.messenger_url, "messenger"),
                instagram_url: normalizeSocialUrl(data.instagram_url, "instagram"),
                tiktok_url: normalizeSocialUrl(data.tiktok_url, "tiktok"),
            };
            console.log("✅ [FORM] Data normalized", { duration: `${(performance.now() - normalizeStart).toFixed(2)}ms` });

            console.log("📡 [FORM] Calling updateProfile API...");
            const apiStart = performance.now();
            const { error } = await updateProfile(profile.id, normalizedData);
            console.log("✅ [FORM] API call completed", { duration: `${(performance.now() - apiStart).toFixed(2)}ms` });

            if (error) throw error;

            toast.success("Profile updated successfully! ✅", {
                position: "top-right",
                autoClose: 3000,
            });

            // Refresh to display normalized URLs
            console.log("🔄 [FORM] Refreshing profile...");
            const refreshStart = performance.now();
            if (refreshProfile) await refreshProfile();
            console.log("✅ [FORM] Profile refreshed", { duration: `${(performance.now() - refreshStart).toFixed(2)}ms` });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Error updating profile. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setSaving(false);
            console.log("🏁 [FORM] handleSave completed", { totalDuration: `${(performance.now() - startTime).toFixed(2)}ms` });
        }
    };

    const handleAvatarUpload = async (url) => {
        try {
            const { error } = await updateProfile(profile.id, { avatar_url: url });

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
                <div className={styles.cardHeaderContainer}>
                    <CardTitle>Edit Profile</CardTitle>
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
                <form onSubmit={(e) => {
                    console.log("📝 [FORM] Form submit triggered");
                    const validationStart = performance.now();
                    form.handleSubmit((data) => {
                        console.log("✅ [FORM] Validation passed", { duration: `${(performance.now() - validationStart).toFixed(2)}ms` });
                        handleSave(data);
                    }, (errors) => {
                        console.log("❌ [FORM] Validation failed", { duration: `${(performance.now() - validationStart).toFixed(2)}ms`, errors });
                    })(e);
                }} className={styles.dashboardForm}>
                    <div className={styles.dashboardAvatarSection}>
                        <div className={styles.dashboardAvatarLabel} role="heading" aria-level="3">Profile Picture *</div>
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
                        required
                        {...form.register("username")}
                        error={form.formState.errors.username?.message}
                    />
                    <Input
                        label="Occupation"
                        type="text"
                        {...form.register("occupation")}
                        error={form.formState.errors.occupation?.message}
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
                                placeholder="Tell us about yourself..."
                            />
                        )}
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
                    <Button type="submit" variant="primary" loading={saving} disabled={saving}>
                        Save Profile
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default ProfileForm;
