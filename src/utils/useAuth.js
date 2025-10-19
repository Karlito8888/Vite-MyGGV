import { useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";

/**
 * Core authentication hook focused only on authentication state management.
 * Provides clean interface for authentication without circular dependencies.
 */
export function useAuth() {
  const authContext = useContext(AuthContext);

  // If context is not available, return default values
  if (!authContext) {
    return {
      user: null,
      loading: true,
      authTransitioning: false,
      loginWithSocial: async () => ({ success: false, error: 'Auth context not available' }),
      logout: async () => {},
    };
  }

  const { user, loading, authTransitioning, loginWithSocial, logout } = authContext;

  return {
    // Core auth properties
    user,
    loading,
    authTransitioning,
    loginWithSocial,
    logout,
  };
}

