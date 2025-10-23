import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClimbingBoxLoader } from "react-spinners";
import { supabase } from "../utils/supabase";
import { onboardingService } from "../services/onboardingService";

import { onboardingSchema } from "../schemas/onboardingSchema";
import { useUser } from "../contexts";
import Avatar from "../components/Avatar";
import Picker from "react-mobile-picker";
import "../styles/Onboarding.css";

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [availableLots, setAvailableLots] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingLots, setLoadingLots] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    clearErrors,
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: "",
      avatar_url: "",
      block: "",
      lot: "",
    },
    mode: "onBlur",
  });

  const selectedBlock = watch("block");

  // Fetch available blocks on component mount
  useEffect(() => {
    const fetchBlocks = async () => {
      setLoadingBlocks(true);
      try {
        const result = await onboardingService.getAvailableBlocks();
        if (result.success) {
          setAvailableBlocks(result.data);
        }
      } catch (error) {
        console.error("Error fetching blocks:", error);
      } finally {
        setLoadingBlocks(false);
      }
    };

    fetchBlocks();
  }, []);

  // Fetch lots when block changes
  useEffect(() => {
    if (!selectedBlock) {
      setAvailableLots([]);
      setValue("lot", "");
      return;
    }

    const fetchLots = async () => {
      setLoadingLots(true);
      try {
        const result = await onboardingService.getLotsByBlock(selectedBlock);
        if (result.success) {
          setAvailableLots(result.data);
          setValue("lot", ""); // Reset lot when block changes
        }
      } catch (error) {
        console.error("Error fetching lots:", error);
      } finally {
        setLoadingLots(false);
      }
    };

    fetchLots();
  }, [selectedBlock, setValue]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const checkOnboardingStatus = async () => {
      // Force minimum 3-second loading time
      const startTime = Date.now();
      
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (profile?.onboarding_completed) {
          navigate("/home");
          return;
        }

        // Fetch profile data for onboarding form
        const result = await onboardingService.getProfileData(user.id);
        if (result.success) {
          reset(result.data);
          setCurrentAvatar(result.data.avatar_url || "");
        }

        // Ensure minimum 3-second loading time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 3000 - elapsedTime);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);

      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Still respect 3-second minimum on error
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 3000 - elapsedTime);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      }
    };

    checkOnboardingStatus();
  }, [user, navigate, reset]);

  const handleAvatarUploadSuccess = (avatarUrl) => {
    setCurrentAvatar(avatarUrl);
    setValue("avatar_url", avatarUrl);
  };

  const onSubmit = async (data) => {
    try {
      // Include avatar URL in submission if available
      const submissionData = { ...data };
      if (currentAvatar) {
        submissionData.avatar_url = currentAvatar;
      }

      // Use completeOnboarding which properly handles onboarding_completed flag
      const result = await onboardingService.completeOnboarding(
        user.id,
        submissionData
      );

      if (result.success) {
        const locationType = result.locationResult?.type;

        if (locationType === "direct_assignment") {
          // Location was assigned directly and onboarding completed
          alert("🎉 Onboarding completed successfully! Welcome to your app!");
          navigate("/home", { replace: true });
        } else if (locationType === "pending_approval") {
          // Location request sent - allow access but show notification
          alert(
            "🎉 Onboarding completed! Your location request has been sent. You can start using the app while waiting for approval."
          );
          navigate("/home", { replace: true });
        } else {
          // Fallback - onboarding completed
          alert("🎉 Onboarding completed successfully! Welcome to your app!");
          navigate("/home", { replace: true });
        }
      } else {
        setFormError("root", {
          message: result.error || "Failed to complete onboarding",
        });
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      setFormError("root", { message: "An error occurred during onboarding" });
    }
  };

  // Show loader while fetching profile data (minimum 3 seconds)
  if (isLoading) {
    return (
      <div className="onboarding-page">
        <div className="container-centered">
          <div className="loader-wrapper">
            <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}>
        <ClimbingBoxLoader color="var(--color-primary)" size={20} loading={true} />
      </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="container-centered">
        <div className="onboarding-content">
          <h2>Welcome to Your PWA App!</h2>
          <p className="onboarding-subtitle">
            Let's get you set up with your essential information
          </p>

          {errors.root && (
            <div className="error-message">{errors.root.message}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="onboarding-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="username"
                    placeholder="Choose a username"
                    maxLength="50"
                    className={errors.username ? "error" : ""}
                    onChange={(e) => {
                      field.onChange(e);
                      if (errors.username) {
                        clearErrors("username");
                      }
                    }}
                  />
                )}
              />
              {errors.username && (
                <span className="error-text">{errors.username.message}</span>
              )}
              <small>
                Letters, numbers, and underscores only (min 3 characters)
              </small>
            </div>

            <div className="form-group">
              <label>Profile Picture</label>
              <div className="avatar-upload-container">
                <Avatar
                  src={currentAvatar}
                  size="large"
                  fallback={watch("username") || "U"}
                  userId={user.id}
                  uploadMode={true}
                  onUploadSuccess={handleAvatarUploadSuccess}
                  defaultAvatar={true}
                />
                <div className="avatar-upload-info">
                  <p>Click to upload or change your profile picture</p>
                  <small>Recommended: Square image, at least 200x200px</small>
                </div>
              </div>
              <Controller
                name="avatar_url"
                control={control}
                render={({ field }) => <input {...field} type="hidden" />}
              />
            </div>

            <div className="form-group">
              <label htmlFor="block">Block *</label>
              <Controller
                name="block"
                control={control}
                render={({ field }) => (
                  <div className="wheel-picker-container">
                    {loadingBlocks ? (
                      <div className="picker-loading">Loading blocks...</div>
                    ) : availableBlocks.length > 0 ? (
                      <Picker
                        value={{ block: field.value || "" }}
                        onChange={(newValue) => {
                          field.onChange(newValue.block);
                          if (errors.block) {
                            clearErrors("block");
                          }
                        }}
                        wheelMode="natural"
                        height={200}
                        itemHeight={40}
                      >
                        <Picker.Column name="block">
                          {availableBlocks.map((block, index) => (
                            <Picker.Item
                              key={`block-${index}-${block}`}
                              value={block}
                            >
                              {({ selected }) => (
                                <div
                                  className={`picker-item ${selected ? "selected" : ""}`}
                                >
                                  {block}
                                </div>
                              )}
                            </Picker.Item>
                          ))}
                        </Picker.Column>
                      </Picker>
                    ) : (
                      <div className="picker-placeholder">
                        No blocks available
                      </div>
                    )}
                  </div>
                )}
              />
              {errors.block && (
                <span className="error-text">{errors.block.message}</span>
              )}
              <small>Select your block number from available locations</small>
            </div>

            <div className="form-group">
              <label htmlFor="lot">Lot *</label>
              <Controller
                name="lot"
                control={control}
                render={({ field }) => (
                  <div
                    className={`wheel-picker-container ${!selectedBlock ? "disabled" : ""}`}
                  >
                    {!selectedBlock ? (
                      <div className="picker-placeholder">
                        Select a block first
                      </div>
                    ) : loadingLots ? (
                      <div className="picker-loading">Loading lots...</div>
                    ) : availableLots.length > 0 ? (
                      <Picker
                        value={{ lot: field.value || "" }}
                        onChange={(newValue) => {
                          field.onChange(newValue.lot);
                          if (errors.lot) {
                            clearErrors("lot");
                          }
                        }}
                        wheelMode="natural"
                        height={200}
                        itemHeight={40}
                      >
                        <Picker.Column name="lot">
                          {availableLots.map((lot, index) => (
                            <Picker.Item
                              key={`lot-${index}-${lot}`}
                              value={lot}
                            >
                              {({ selected }) => (
                                <div
                                  className={`picker-item ${selected ? "selected" : ""}`}
                                >
                                  {lot}
                                </div>
                              )}
                            </Picker.Item>
                          ))}
                        </Picker.Column>
                      </Picker>
                    ) : (
                      <div className="picker-placeholder">
                        No lots available
                      </div>
                    )}
                  </div>
                )}
              />
              {errors.lot && (
                <span className="error-text">{errors.lot.message}</span>
              )}
              <small>Select your lot number from available locations</small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                width: "100%",
                maxWidth: "300px",
                margin: "2rem auto 0",
                display: "block",
              }}
            >
              {isSubmitting ? "Completing Setup..." : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
