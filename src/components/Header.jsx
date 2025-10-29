import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ggvLogo from "../assets/img/ggv.png";
import Avatar from "./Avatar";
import UserProfileModal from "./UserProfileModal";
import { useUser } from '../contexts'
import { supabase } from '../utils/supabase'
import { BeatLoader } from "react-spinners";
import {
  listActiveHeaderMessages,
  subscribeToHeaderMessages,
  unsubscribeFromHeaderMessages,
} from "../services/messagesHeaderService";
import styles from "./Header.module.css";

function Header() {
  const { user } = useUser()
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const subscriptionRef = useRef(null);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const loadingStartTimeRef = useRef(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const pendingMessagesRef = useRef(null); // Queue for new messages during current cycle

  // Avatar refs
  const avatarElementRef = useRef(null);



  const fetchMessages = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
      setError(null);
      loadingStartTimeRef.current = Date.now();
    }

    try {
      const { data, error } = await listActiveHeaderMessages();
      if (error) {
        if (isInitialLoad) {
          setError(error);
          setMessages([]);
        }
      } else {
        const newMessages = data || [];

        // If messages are currently displaying, queue the update for next cycle
        if (!isInitialLoad && messages.length > 0) {
          pendingMessagesRef.current = newMessages;
        } else {
          // Initial load or no messages yet - apply immediately
          setMessages(newMessages);
        }
      }
    } catch (err) {
      if (isInitialLoad) {
        setError(err);
        setMessages([]);
      }
    } finally {
      if (isInitialLoad) {
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
    }
  }, []); // Removed messages.length dependency to prevent re-subscriptions

  useEffect(() => {
    if (!user) {
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
      return;
    }

    fetchMessages(true); // Initial load

    // Setup realtime subscription for messages
    const subscription = subscribeToHeaderMessages(
      () => fetchMessages(false), // onMessageChange callback - queue updates
      (status) => {
        // onStatusChange callback
        if (status === "SUBSCRIBED") {
          setSubscriptionError(null);
        } else if (status === "CHANNEL_ERROR") {
          setSubscriptionError("Connection failed, Please refresh");
        }
      }
    );

    // Setup realtime subscription for profile changes
    console.log('[REALTIME] 🔌 Subscribing to profile-avatar-changes channel')
    const profileChannel = supabase
      .channel('profile-avatar-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          // When a profile changes, update messages in memory
          setMessages(prevMessages =>
            prevMessages.map(msg => {
              if (msg.user?.id === payload.new.id) {
                return {
                  ...msg,
                  user: {
                    ...msg.user,
                    avatar_url: payload.new.avatar_url,
                    username: payload.new.username,
                    full_name: payload.new.full_name
                  }
                }
              }
              return msg
            })
          )
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] 📡 Profile avatar changes channel status:', status)
      })

    subscriptionRef.current = subscription;

    return () => {
      console.log('[REALTIME] 🔌 Unsubscribing from header messages and profile-avatar-changes')
      unsubscribeFromHeaderMessages(subscription);
      supabase.removeChannel(profileChannel);
    };
  }, [user]); // Only depend on user, not fetchMessages

  // Message rotation effect
  useEffect(() => {
    if (messages.length <= 1) {
      // Single message: just check for pending updates
      const interval = setInterval(() => {
        if (pendingMessagesRef.current) {
          setMessages(pendingMessagesRef.current);
          pendingMessagesRef.current = null;
          setCurrentMessageIndex(0);
        }
      }, 4000);
      return () => clearInterval(interval);
    }

    // Multiple messages: rotate through them
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % messages.length;

        // Apply pending messages when cycle completes
        if (nextIndex === 0 && pendingMessagesRef.current) {
          setMessages(pendingMessagesRef.current);
          pendingMessagesRef.current = null;
          return 0;
        }

        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [messages.length]);

  const currentMessage = useMemo(() => {
    if (messages.length === 0) return null;
    return messages[currentMessageIndex];
  }, [messages, currentMessageIndex]);

  return (
    <header className={styles.header}>
      <div className={`${styles.headerContent} df wh100`}>
        {/* Avatar with Framer Motion */}
        <AnimatePresence mode="wait">
          {user && messages.length > 0 && currentMessage?.user?.id && (
            <motion.div
              key={currentMessage.user.id}
              ref={avatarElementRef}
              className={`${styles.headerAvatar} ${styles.headerAvatarClickable}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedUserId(currentMessage?.user?.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedUserId(currentMessage?.user?.id);
                }
              }}
              aria-label={`View ${currentMessage.user.username || "User"}'s profile`}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }
              }}
              exit={{
                opacity: 0,
                scale: 0.5,
                rotate: 10,
                transition: { duration: 0.2 }
              }}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                willChange: 'opacity, transform',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              }}
            >
              <Avatar
                src={currentMessage?.user?.avatar_url || null}
                userId={currentMessage?.user?.id}
                alt={`${currentMessage?.user?.username || "User"} avatar`}
                size="small"
                fallback={currentMessage?.user?.username || "U"}
                showPresence={true}
                className="header-avatar-component"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.headerMain}>
          {user ? (
            loading ? (
              <div className={styles.headerCarousel}>
                <div className={`${styles.carouselMessage} ${styles.carouselLoading}`} role="status" aria-live="polite">
                  <span className="sr-only">Loading messages...</span>
                  <BeatLoader color="#ffffff" size={8} margin={2} aria-hidden="true" />
                </div>
              </div>
            ) : error || subscriptionError ? (
              <div className={styles.headerCarousel}>
                <div className={`${styles.carouselMessage} ${styles.carouselError}`}>
                  {subscriptionError || "Unable to load messages"}
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className={styles.headerCarousel}>
                <div className={`${styles.carouselMessage} ${styles.carouselEmpty} sr-only`}>
                  Welcome to MyGGV!
                </div>
              </div>
            ) : (
              <div className={styles.headerCarousel}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMessageIndex}
                    className={`${styles.carouselMessage} ${styles.carouselActive}`}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    style={{
                      willChange: 'opacity, transform',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translateZ(0)'
                    }}
                  >
                    {currentMessage.message}
                  </motion.div>
                </AnimatePresence>
              </div>
            )
          ) : (
            <>
              <img src={ggvLogo} alt="MyGGV" className={styles.headerLogo} />
              <h1 className="sr-only">MyGGV</h1>
            </>
          )}
        </div>
      </div>
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </header>
  );
}

export default Header;