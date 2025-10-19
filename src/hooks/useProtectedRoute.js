import { useMemo } from 'react'
import { useAuth } from '../utils/useAuth'

/**
 * Simple hook for basic route protection logic.
 * Only handles authentication verification, not onboarding.
 * 
 * @returns {Object} Route protection state and decisions
 */
export function useProtectedRoute() {
  const { user, loading: authLoading, authTransitioning } = useAuth()

  // Memoize protection decisions to prevent unnecessary recalculations
  const protectionState = useMemo(() => {
    // Show loading during auth check or transition
    if (authLoading || authTransitioning) {
      return {
        canAccess: false,
        loading: true,
        redirectTo: null,
        reason: 'auth_loading'
      }
    }

    // Redirect to login if not authenticated
    if (!user) {
      return {
        canAccess: false,
        loading: false,
        redirectTo: '/login',
        reason: 'unauthenticated'
      }
    }

    // Allow access for authenticated users (onboarding check handled separately)
    return {
      canAccess: true,
      loading: false,
      redirectTo: null,
      reason: 'access_granted'
    }
  }, [user, authLoading, authTransitioning])

  return protectionState
}

/**
 * @deprecated This hook is no longer needed.
 * Use the simplified ProtectedRoute component that handles onboarding checking directly.
 * Kept for backward compatibility but should not be used in new code.
 */
export function useProtectedRouteWithOnboarding() {
  console.warn('useProtectedRouteWithOnboarding is deprecated. Use the simplified ProtectedRoute component instead.')
  
  const { 
    user, 
    loading: authLoading, 
    authTransitioning, 
    checkOnboardingStatus,
    getOnboardingStatusWithCache
  } = useAuth()

  return {
    user,
    loading: authLoading,
    authTransitioning,
    checkOnboardingStatus,
    getOnboardingStatusWithCache,
    canAccess: false,
    reason: 'deprecated_use_protected_route_component'
  }
}