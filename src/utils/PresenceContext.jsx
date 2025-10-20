import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "./supabase";
import { useUser } from "../contexts/UserContext";

const PresenceContext = createContext();

export { PresenceContext };

export function PresenceProvider({ children }) {
  const [isOnline, setIsOnline] = useState(false);
  const [presenceChannel, setPresenceChannel] = useState(null);
  const { user } = useUser()

  useEffect(() => {
    let channel = null;

    const cleanup = () => {
      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };

    if (!user) {
      // Clean up presence when user logs out
      cleanup();
      setIsOnline(false);
      setPresenceChannel(null);
      return;
    }

    // Initialize presence for authenticated user
    const initializePresence = async () => {
      try {
        // Create a unique channel for the user
        channel = supabase.channel(`user_presence_${user.id}`);

        // Set up presence event handlers
        channel
          .on("presence", { event: "sync" }, () => {
            const presenceState = channel.presenceState();

            // Check if user is present in any key (Supabase uses generated keys)
            const userKeys = Object.keys(presenceState);
            const isUserOnline = userKeys.some((key) => {
              const presences = presenceState[key];
              return presences.some((presence) => presence.user_id === user.id);
            });

            setIsOnline(isUserOnline);
          })
          .on("presence", { event: "join" }, ({ newPresences }) => {
            // Check if the joined presence belongs to our user
            const isUserJoin = newPresences.some(
              (presence) => presence.user_id === user.id
            );
            if (isUserJoin) {
              setIsOnline(true);
            }
          })
          .on("presence", { event: "leave" }, ({ leftPresences }) => {
            // Check if the left presence belongs to our user
            const isUserLeave = leftPresences.some(
              (presence) => presence.user_id === user.id
            );
            if (isUserLeave) {
              setIsOnline(false);
            }
          })
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              // Track the user's presence with their info
              const trackData = {
                user_id: user.id,
                email: user.email,
                online_at: new Date().toISOString(),
              };

              try {
                await channel.track(trackData);
                setPresenceChannel(channel);
              } catch (error) {
                console.error("Error tracking presence:", error);
              }
            }
          });
      } catch (error) {
        console.error("Error initializing presence:", error);
        setIsOnline(false);
      }
    };

    initializePresence();

    // Cleanup function
    return cleanup;
  }, [user]);

  const value = {
    isOnline,
    presenceChannel,
  };

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error("usePresence must be used within a PresenceProvider");
  }
  return context;
};