import { createContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { PresenceProvider } from "./PresenceContext";
import { onboardingService } from "../services/onboardingService";

const AuthContext = createContext();

export { AuthContext };



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authTransitioning, setAuthTransitioning] = useState(false);

  useEffect(() => {
    // Check for existing session on app load using claims-based authentication
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getClaims();

        if (error) {
          console.error('Failed to get claims:', error.message);
          setUser(null);
        } else if (data?.claims) {
          // Extract user info from JWT claims using Supabase's getClaims() method
          const userData = {
            id: data.claims.sub,
            email: data.claims.email,
            role: data.claims.role || 'authenticated',
            user_metadata: data.claims.user_metadata || {},
            app_metadata: data.claims.app_metadata || {}
          };
          
          // Fetch onboarding status
          try {
            const onboardingResult = await onboardingService.getOnboardingStatus(data.claims.sub);
            userData.onboarding_completed = onboardingResult.onboardingCompleted;
          } catch (error) {
            console.error('Error fetching onboarding status:', error);
            userData.onboarding_completed = false;
          }
          
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);

      // Skip INITIAL_SESSION to avoid double processing
      if (event === 'INITIAL_SESSION') {
        return;
      }

      // Set transitioning state briefly
      setAuthTransitioning(true);

      if (session?.user) {
        // Get claims for the authenticated user
        const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
        
        if (claimsError) {
          console.error('Failed to get claims:', claimsError.message);
          setUser(null);
        } else if (claimsData?.claims) {
          const userData = {
            id: claimsData.claims.sub,
            email: claimsData.claims.email,
            role: claimsData.claims.role || 'authenticated',
            user_metadata: claimsData.claims.user_metadata || {},
            app_metadata: claimsData.claims.app_metadata || {}
          };
          
          // Fetch onboarding status
          try {
            const onboardingResult = await onboardingService.getOnboardingStatus(claimsData.claims.sub);
            userData.onboarding_completed = onboardingResult.onboardingCompleted;
          } catch (error) {
            console.error('Error fetching onboarding status:', error);
            userData.onboarding_completed = false;
          }
          
          setUser(userData);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
      // Immediate transition end - no artificial delay
      setAuthTransitioning(false);
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
    authTransitioning,
  };

  return (
    <AuthContext.Provider value={value}>
      <PresenceProvider>
        {children}
      </PresenceProvider>
    </AuthContext.Provider>
  );
}
