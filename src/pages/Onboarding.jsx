import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClimbingBoxLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../utils/supabase";
import { onboardingService } from "../services/onboardingService";

import { onboardingSchema } from "../schemas/onboardingSchema";
import { useUser } from "../contexts";
import AvatarUploader from "../components/ui/AvatarUploader";
import Button from "../components/ui/Button";
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
  const [blocksError, setBlocksError] = useState(null);
  const [lotsError, setLotsError] = useState(null);

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
      setBlocksError(null);
      try {
        const result = await onboardingService.getAvailableBlocks();
        if (result.success) {
          setAvailableBlocks(result.data);
          if (result.data.length === 0) {
            const errorMsg = "No blocks available. Please contact support.";
            setBlocksError(errorMsg);
            toast.error(errorMsg);
          }
        } else {
          const errorMsg = result.error || "Failed to load blocks";
          setBlocksError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        console.error("Error fetching blocks:", error);
        const errorMsg = "Failed to load blocks. Please refresh the page.";
        setBlocksError(errorMsg);
        toast.error(errorMsg);
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
      setLotsError(null);
      return;
    }

    const fetchLots = async () => {
      setLoadingLots(true);
      setLotsError(null);
      try {
        const result = await onboardingService.getLotsByBlock(selectedBlock);
        if (result.success) {
          setAvailableLots(result.data);
          setValue("lot", ""); // Reset lot when block changes
          if (result.data.length === 0) {
            const errorMsg = `No lots available for block ${selectedBlock}`;
            setLotsError(errorMsg);
            toast.warning(errorMsg);
          }
        } else {
          const errorMsg = result.error || "Failed to load lots";
          setLotsError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        console.error("Error fetching lots:", error);
        const errorMsg = "Failed to load lots. Please try selecting another block.";
        setLotsError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoadingLots(false);
      }
    };

    fetchLots();
  }, [selectedBlock, setValue]);

  // Helper function to ensure minimum loading time
  const ensureMinimumLoadingTime = (startTime, minTime = 3000) => {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minTime - elapsedTime);
    return new Promise(resolve => setTimeout(resolve, remainingTime));
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const checkOnboardingStatus = async () => {
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
        await ensureMinimumLoadingTime(startTime);
        setIsLoading(false);

      } catch (error) {
        console.error("Error checking onboarding status:", error);
        toast.error("Failed to load onboarding data. Please refresh the page.");
        
        // Still respect 3-second minimum on error
        await ensureMinimumLoadingTime(startTime);
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, navigate, reset]);

  const handleAvatarUploadSuccess = (avatarUrl) => {
    setCurrentAvatar(avatarUrl);
    setValue("avatar_url", avatarUrl);
    clearErrors("avatar_url");
    toast.success("Profile picture uploaded successfully!");
  };

  const onSubmit = async (data) => {
    try {
      // Include avatar URL in submission
      const submissionData = {
        ...data,
        avatar_url: currentAvatar
      };

      // Use completeOnboarding which properly handles onboarding_completed flag
      const result = await onboardingService.completeOnboarding(
        user.id,
        submissionData
      );

      if (result.success) {
        const locationType = result.locationResult?.type;

        if (locationType === "direct_assignment") {
          // Location was assigned directly and onboarding completed
          toast.success("🎉 Onboarding completed successfully! Welcome to your app!");
          setTimeout(() => navigate("/home", { replace: true }), 1500);
        } else if (locationType === "pending_approval") {
          // Location request sent - MUST WAIT for owner approval
          toast.info(
            "📬 Your location request has been sent to the owner. You will be able to access the app once the owner approves your request. Please check back later.",
            { autoClose: 6000 }
          );
          // Redirect to a waiting page or logout
          setTimeout(() => {
            // Log out the user since they can't access the app yet
            supabase.auth.signOut()
            navigate("/login", { replace: true })
          }, 6000);
        } else {
          // Fallback - onboarding completed
          toast.success("🎉 Onboarding completed successfully! Welcome to your app!");
          setTimeout(() => navigate("/home", { replace: true }), 1500);
        }
      } else {
        toast.error(result.error || "Failed to complete onboarding");
        setFormError("root", {
          message: result.error || "Failed to complete onboarding",
        });
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      const errorMessage = "An error occurred during onboarding";
      toast.error(errorMessage);
      setFormError("root", { message: errorMessage });
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
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
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
              <label htmlFor="username">Username *</label>
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
                Required: Letters, numbers, underscores, spaces, and hyphens (min 3 characters)
              </small>
            </div>

            <div className="form-group">
              <label>Profile Picture *</label>
              <div className="avatar-upload-container">
                <AvatarUploader
                  currentAvatar={currentAvatar}
                  userId={user.id}
                  onUploadSuccess={handleAvatarUploadSuccess}
                  fallback={watch("username") || "U"}
                  size="large"
                />
                <div className="avatar-upload-info">
                  <p>Drag & drop or click to upload your profile picture</p>
                  <small>Required: Square image, at least 200x200px, max 5MB</small>
                </div>
              </div>
              {errors.avatar_url && (
                <span className="error-text">{errors.avatar_url.message}</span>
              )}
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
              {blocksError && (
                <span className="error-text">{blocksError}</span>
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
              {lotsError && (
                <span className="error-text">{lotsError}</span>
              )}
              <small>Select your lot number from available locations</small>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              style={{
                width: "100%",
                maxWidth: "300px",
                margin: "2rem auto 0",
                display: "block",
              }}
            >
              Complete Setup
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
