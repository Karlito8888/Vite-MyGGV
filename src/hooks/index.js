/**
 * Centralized hooks directory for authentication and onboarding logic.
 * 
 * This directory contains custom hooks that extract and consolidate
 * logic from components, services, and contexts to improve maintainability
 * and reusability across the application.
 */

// Authentication and onboarding hooks
export { useProtectedRoute, useProtectedRouteWithOnboarding } from './useProtectedRoute'

/**
 * Available hooks:
 * 
 * useProtectedRoute():
 * - Extracts route protection logic from ProtectedRoute component
 * - Provides authentication verification
 * - Returns loading states and redirect decisions
 * 
 * useProtectedRouteWithOnboarding():
 * - Enhanced version that includes onboarding status checking
 * - Provides complete route protection logic with async onboarding verification
 * - Used by ProtectedRoute component
 * 
 * Usage patterns:
 * 
 * // Basic auth only
 * const auth = useAuth()
 * 
 * // Route protection
 * const protection = useProtectedRouteWithOnboarding()
 */