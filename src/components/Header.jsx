import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import "../styles/Header.css";
import ggvLogo from "../assets/img/ggv.png";
import Avatar from "./Avatar";
import { useUser } from '../contexts/UserContext'
import {
  listActiveHeaderMessages,
  subscribeToHeaderMessages,
  unsubscribeFromHeaderMessages,
} from "../services/messagesHeaderService";

function Header() {
  const { user } = useUser()
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [transitionState, setTransitionState] = useState("idle"); // 'idle', 'fading-out', 'fading-in'
  const subscriptionRef = useRef(null);
  const [subscriptionError, setSubscriptionError] = useState(null);

  // Avatar state management
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const avatarTransitionRef = useRef(null);
  const avatarTimerRef = useRef(null);

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
      setLoading(false);
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

        // Clear avatar timer when message changes
        if (avatarTimerRef.current) {
          clearTimeout(avatarTimerRef.current);
        }

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

      return () => {
        clearInterval(interval);
        if (avatarTimerRef.current) {
          clearTimeout(avatarTimerRef.current);
        }
      };
    }
  }, [messages.length]);

  const currentMessage = useMemo(() => {
    if (messages.length === 0) return null;
    return messages[currentMessageIndex];
  }, [messages, currentMessageIndex]);

  // JavaScript-only transition functions
  const fadeInAvatar = useCallback(() => {
    if (isTransitioning || isAvatarVisible) return;

    setIsTransitioning(true);
    setIsAvatarVisible(true);

    const avatarElement = document.querySelector(".header-avatar");

    // Skip animation if reduced motion is preferred or element not found
    if (prefersReducedMotion || !avatarElement) {
      if (avatarElement) {
        avatarElement.style.opacity = 1;
      }
      setIsTransitioning(false);
      return;
    }

    const startTime = performance.now();
    const duration = 300; // 300ms duration

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Linear easing for simplicity
      const opacity = progress;

      avatarElement.style.opacity = opacity;

      if (progress < 1) {
        avatarTransitionRef.current = requestAnimationFrame(animate);
      } else {
        setIsTransitioning(false);
      }
    };

    avatarTransitionRef.current = requestAnimationFrame(animate);
  }, [isTransitioning, isAvatarVisible, prefersReducedMotion]);

  const fadeOutAvatar = useCallback(() => {
    if (isTransitioning || !isAvatarVisible) return;

    setIsTransitioning(true);
    setIsAvatarVisible(false);

    const avatarElement = document.querySelector(".header-avatar");

    // Skip animation if reduced motion is preferred or element not found
    if (prefersReducedMotion || !avatarElement) {
      if (avatarElement) {
        avatarElement.style.opacity = 0;
      }
      setIsTransitioning(false);
      return;
    }

    const startTime = performance.now();
    const duration = 300; // 300ms duration

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Linear easing for simplicity
      const opacity = 1 - progress;

      avatarElement.style.opacity = opacity;

      if (progress < 1) {
        avatarTransitionRef.current = requestAnimationFrame(animate);
      } else {
        setIsTransitioning(false);
      }
    };

    avatarTransitionRef.current = requestAnimationFrame(animate);
  }, [isTransitioning, isAvatarVisible, prefersReducedMotion]);

  // Cleanup transitions and timers on unmount
  useEffect(() => {
    return () => {
      if (avatarTransitionRef.current) {
        cancelAnimationFrame(avatarTransitionRef.current);
      }
      if (avatarTimerRef.current) {
        clearTimeout(avatarTimerRef.current);
      }
    };
  }, []);

  // Handle avatar visibility synchronized with message display
  useEffect(() => {
    // Check if current message has a user (from the join with profiles)
    const messageHasUser =
      currentMessage && currentMessage.user && currentMessage.user.id;

    if (
      user &&
      messages.length > 0 &&
      transitionState === "idle" &&
      messageHasUser
    ) {
      // Clear any existing timer
      if (avatarTimerRef.current) {
        clearTimeout(avatarTimerRef.current);
      }

      // Show avatar when message is displayed
      fadeInAvatar();

      // Hide avatar after 4000ms (message duration)
      avatarTimerRef.current = setTimeout(() => {
        fadeOutAvatar();
      }, 4000);

      return () => {
        if (avatarTimerRef.current) {
          clearTimeout(avatarTimerRef.current);
        }
      };
    } else {
      // Hide avatar when no user, no messages, or message has no user
      fadeOutAvatar();
      if (avatarTimerRef.current) {
        clearTimeout(avatarTimerRef.current);
      }
    }
  }, [
    user,
    messages.length,
    currentMessageIndex,
    transitionState,
    currentMessage,
    fadeInAvatar,
    fadeOutAvatar,
  ]);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content df wh100">
          {/* Avatar positioned absolutely on the left */}
          {user &&
            messages.length > 0 &&
            currentMessage?.user &&
            currentMessage.user.id && (
              <div
                className="header-avatar"
                role="img"
                aria-label={`${
                  currentMessage.user.full_name ||
                  currentMessage.user.email ||
                  "User"
                } profile avatar`}
              >
                <Avatar
                  src={currentMessage.user.avatar_url}
                  alt={`${
                    currentMessage.user.full_name ||
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
                  <div className="carousel-message carousel-loading">
                    Loading messages...
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