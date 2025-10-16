import { createContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { getCurrentUserWithClaims } from "./authHelpers";
import { PresenceProvider } from "./PresenceContext";

const AuthContext = createContext();

export { AuthContext };



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load using getClaims() for better security
    const getClaimsSession = async () => {
      const { user, error, method } = await getCurrentUserWithClaims(true);

      if (error) {
         
        console.error(`Authentication failed using ${method}:`, error.message);
        setUser(null);
      } else {
        setUser(user);
        if (method === "getUser") {
           
          console.warn(
            "Using fallback authentication method - consider updating Supabase client"
          );
        }
      }

      setLoading(false);
    };

    getClaimsSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // When auth state changes, verify with getClaims() for security
      if (session?.user) {
        const { user, error, method } = await getCurrentUserWithClaims(true);

        if (error || !user) {
           
          console.error(
            `Auth verification failed using ${method}:`,
            error?.message || "No user found"
          );
          setUser(null);
        } else {
          setUser(user);
          if (method === "getUser") {
             
            console.warn(
              "Using fallback authentication method during auth state change"
            );
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithSocial = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch {
      return { success: false, error: `${provider} login failed` };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loginWithSocial,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      <PresenceProvider>
        {children}
      </PresenceProvider>
    </AuthContext.Provider>
  );
}
