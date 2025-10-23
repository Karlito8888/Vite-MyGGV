import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ggvLogo from "../assets/img/ggv.png";
import Avatar from "./Avatar";
import { useUser } from '../contexts'
import { BeatLoader } from "react-spinners";
import {
  listActiveHeaderMessages,
  subscribeToHeaderMessages,
  unsubscribeFromHeaderMessages,
} from "../services/messagesHeaderService";
import "../styles/Header.css";

function Header() {
  const { user } = useUser()
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [transitionState, setTransitionState] = useState("idle"); // 'idle', 'fading-out', 'fading-in'
  const subscriptionRef = useRef(null);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const loadingStartTimeRef = useRef(null);

  // Avatar refs and state
  const avatarElementRef = useRef(null);
  const avatarTransitionRef = useRef(null);
  const messageTimerRef = useRef(null);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  }, []);



  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    loadingStartTimeRef.current = Date.now();

    try {
      const { data, error } = await listActiveHeaderMessages();
      if (error) {
        setError(error);
        setMessages([]);
      } else {
        setMessages(data || []);
      }
    } catch (err) {
      setError(err);
      setMessages([]);
    } finally {
      // Ensure minimum 2-second loading duration
      const loadingDuration = Date.now() - loadingStartTimeRef.current;
      const remainingTime = Math.max(0, 2000 - loadingDuration);
      
      if (remainingTime > 0) {
        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages();

      // Setup realtime subscription through service
      const subscription = subscribeToHeaderMessages(
        fetchMessages, // onMessageChange callback
        (status) => {
          // onStatusChange callback
          if (status === "SUBSCRIBED") {
            setSubscriptionError(null);
          } else if (status === "CHANNEL_ERROR") {
            setSubscriptionError("Realtime connection failed");
          }
        }
      );

      subscriptionRef.current = subscription;

      return () => {
        unsubscribeFromHeaderMessages(subscription);
      };
    } else {
      // Cleanup when user logs out
      if (subscriptionRef.current) {
        unsubscribeFromHeaderMessages(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      setMessages([]);
      setError(null);
      setSubscriptionError(null);
      setLoading(false);
      setCurrentMessageIndex(0);
    }
  }, [user, fetchMessages]);

  // Message rotation effect with transitions
  useEffect(() => {
    if (messages.length > 1) {
      const interval = setInterval(() => {
        // Start fade-out transition
        setTransitionState("fading-out");

        // After fade-out completes, change message and start fade-in
        setTimeout(() => {
          setCurrentMessageIndex(
            (prevIndex) => (prevIndex + 1) % messages.length
          );
          setTransitionState("fading-in");

          // After fade-in completes, return to idle
          setTimeout(() => {
            setTransitionState("idle");
          }, 300); // fade-in duration
        }, 300); // fade-out duration
      }, 4000); // 4 seconds per message

      return () => clearInterval(interval);
    }
  }, [messages.length]);

  const currentMessage = useMemo(() => {
    if (messages.length === 0) return null;
    return messages[currentMessageIndex];
  }, [messages, currentMessageIndex]);

  // JavaScript-only transition functions with ref instead of querySelector
  const animateAvatarOpacity = useCallback((targetOpacity) => {
    if (!avatarElementRef.current) return;

    // Cancel any ongoing animation
    if (avatarTransitionRef.current) {
      cancelAnimationFrame(avatarTransitionRef.current);
    }

    // Skip animation if reduced motion is preferred
    if (prefersReducedMotion) {
      avatarElementRef.current.style.opacity = targetOpacity;
      return;
    }

    const startOpacity = parseFloat(avatarElementRef.current.style.opacity) || 0;
    const startTime = performance.now();
    const duration = 300;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const opacity = startOpacity + (targetOpacity - startOpacity) * progress;

      avatarElementRef.current.style.opacity = opacity;

      if (progress < 1) {
        avatarTransitionRef.current = requestAnimationFrame(animate);
      }
    };

    avatarTransitionRef.current = requestAnimationFrame(animate);
  }, [prefersReducedMotion]);

  // Cleanup transitions and timers on unmount
  useEffect(() => {
    const timer = messageTimerRef.current;
    return () => {
      if (avatarTransitionRef.current) {
        cancelAnimationFrame(avatarTransitionRef.current);
      }
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  // Handle avatar visibility synchronized with message display
  useEffect(() => {
    const messageHasUser = currentMessage?.user?.id;
    const shouldShowAvatar = user && messages.length > 0 && messageHasUser;

    if (shouldShowAvatar && transitionState === "idle") {
      // Show avatar immediately when message appears
      animateAvatarOpacity(1);
    } else if (!shouldShowAvatar) {
      // Hide avatar when conditions not met
      animateAvatarOpacity(0);
    }
  }, [user, messages.length, currentMessage, transitionState, animateAvatarOpacity]);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content df wh100">
          {/* Avatar positioned absolutely on the left */}
          {user &&
            messages.length > 0 &&
            currentMessage?.user?.id && (
              <div
                ref={avatarElementRef}
                className="header-avatar"
                style={{ opacity: 0 }}
                role="img"
                aria-label={`${currentMessage.user.full_name ||
                  currentMessage.user.email ||
                  "User"
                  } profile avatar`}
              >
                <Avatar
                  src={currentMessage.user.avatar_url}
                  alt={`${currentMessage.user.full_name ||
                    currentMessage.user.email ||
                    "User"
                    } avatar`}
                  size="small"
                  fallback={
                    currentMessage.user.full_name ||
                    currentMessage.user.email ||
                    "User"
                  }
                  defaultAvatar={true}
                  className="header-avatar-component"
                />
              </div>
            )}

          <div className="header-main">
            {user ? (
              loading ? (
                <div className="header-carousel">
                  <div className="carousel-message carousel-loading" role="status" aria-live="polite">
                    <span className="sr-only">Loading messages...</span>
                    <BeatLoader color="#ffffff" size={8} margin={2} aria-hidden="true" />
                  </div>
                </div>
              ) : error || subscriptionError ? (
                <div className="header-carousel">
                  <div className="carousel-message carousel-error">
                    {subscriptionError || "Unable to load messages"}
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="header-carousel">
                  <div className="carousel-message carousel-empty sr-only">
                    Welcome to MyGGV!
                  </div>
                </div>
              ) : (
                <div className="header-carousel">
                  <div
                    className={`carousel-message carousel-active ${transitionState}`}
                  >
                    {currentMessage.message}
                  </div>
                </div>
              )
            ) : (
              <>
                <img src={ggvLogo} alt="MyGGV" className="header-logo" />
                <h1 className="sr-only">MyGGV</h1>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;