/**
 * Centralized hooks directory for authentication and data preloading.
 * 
 * This directory contains custom hooks that extract and consolidate
 * logic from components, services, and contexts to improve maintainability
 * and reusability across the application.
 */

// Authentication hooks
export { useUser } from '../contexts/UserContext'

/**
 * Available hooks:
 * 
 * useUser():
 * - Provides access to UserContext authentication state
 * - Returns user object, loading state, and authentication status
 * - Must be used within UserProvider
 * 
 * Usage:
 * const { user, loading, initialized } = useUser()
 */