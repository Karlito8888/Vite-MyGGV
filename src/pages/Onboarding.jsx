import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClimbingBoxLoader } from "react-spinners";
import { toast } from "react-toastify";
import { supabase } from "../utils/supabase";
import { onboardingService } from "../services/onboardingService";

import { onboardingSchema } from "../schemas/onboardingSchema";
import { useUser } from "../contexts";
import AvatarUploader from "../components/ui/AvatarUploader";
import Button from "../components/ui/Button";
import Picker from "react-mobile-picker";
import styles from "../styles/Onboarding.module.css";

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
        toast.error(
          <div>
            Failed to load blocks.
            <br />
            Please refresh the page.
          </div>
        );
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
        toast.error(
          <div>
            Failed to load lots.
            <br />
            Please try selecting another block.
          </div>
        );
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
          // Ensure minimum 3-second loading time before redirecting
          await ensureMinimumLoadingTime(startTime);
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
        toast.error(
          <div>
            Failed to load onboarding data.
            <br />
            Please refresh the page.
          </div>
        );

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
      // Ensure avatar_url is set from currentAvatar state
      const submissionData = {
        username: data.username,
        avatar_url: currentAvatar,
        block: data.block,
        lot: data.lot
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
          toast.success(
            <div>
              🎉 Onboarding completed successfully!
              <br />
              Welcome to your app!
            </div>
          );
          setTimeout(() => navigate("/home", { replace: true }), 1500);
        } else if (locationType === "pending_approval") {
          // Location request sent - MUST WAIT for owner approval
          toast.info(
            <div>
              📬 Your location request has been sent to the owner.
              <br />
              You will be notified once approved.
            </div>,
            { autoClose: 3000 }
          );
          // Redirect to pending approval page
          setTimeout(() => {
            navigate("/pending-approval", { replace: true })
          }, 3000);
        } else {
          // Fallback - onboarding completed
          toast.success(
            <div>
              🎉 Onboarding completed successfully!
              <br />
              Welcome to your app!
            </div>
          );
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
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-background, #fff)'
      }}>
        <ClimbingBoxLoader color="var(--color-primary)" size={20} loading={true} />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h2>Welcome to Your PWA App!</h2>
            <p className="page-subtitle">
              Let's get you set up with your essential information
            </p>
          </div>

          {errors.root && (
            <div className={styles.errorMessage}>{errors.root.message}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.onboardingForm}>
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
                <span className={styles.errorText}>{errors.username.message}</span>
              )}
              <small>
                Required: Letters, numbers, underscores, spaces, and hyphens (min 3 characters)
              </small>
            </div>

            <div className="form-group">
              <label>Profile Picture *</label>
              <div className={styles.avatarUploadContainer}>
                <AvatarUploader
                  currentAvatar={currentAvatar}
                  userId={user.id}
                  onUploadSuccess={handleAvatarUploadSuccess}
                  fallback={watch("username") || "U"}
                  size="large"
                />
                <div className={styles.avatarUploadInfo}>
                  <p>Drag & drop or click to upload your profile picture</p>
                  <small>Required: Square image, at least 200x200px, max 5MB</small>
                </div>
              </div>
              {errors.avatar_url && (
                <span className={styles.errorText}>{errors.avatar_url.message}</span>
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
                  <div className={styles.wheelPickerContainer}>
                    {loadingBlocks ? (
                      <div className={styles.pickerLoading}>Loading blocks...</div>
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
                      <div className={styles.pickerPlaceholder}>
                        No blocks available
                      </div>
                    )}
                  </div>
                )}
              />
              {errors.block && (
                <span className={styles.errorText}>{errors.block.message}</span>
              )}
              {blocksError && (
                <span className={styles.errorText}>{blocksError}</span>
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
                      <div className={styles.pickerPlaceholder}>
                        Select a block first
                      </div>
                    ) : loadingLots ? (
                      <div className={styles.pickerLoading}>Loading lots...</div>
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
                      <div className={styles.pickerPlaceholder}>
                        No lots available
                      </div>
                    )}
                  </div>
                )}
              />
              {errors.lot && (
                <span className={styles.errorText}>{errors.lot.message}</span>
              )}
              {lotsError && (
                <span className={styles.errorText}>{lotsError}</span>
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
    </PageTransition>
  );
}

export default Onboarding;
