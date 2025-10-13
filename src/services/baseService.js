import { supabase } from '../utils/supabase'

/**
 * Base service utilities for common CRUD patterns
 * Provides consistent error handling and response formatting
 */

/**
 * Standard response format for all service operations
 * @typedef {Object} ServiceResponse
 * @property {*} data - The data returned from the operation (null on error)
 * @property {Error|null} error - The error object (null on success)
 */

/**
 * Handles Supabase query execution with consistent error handling
 * @param {Promise} queryPromise - The Supabase query promise
 * @returns {Promise<ServiceResponse>}
 */
export async function executeQuery(queryPromise) {
  try {
    const { data, error } = await queryPromise
    
    if (error) {
      console.error('Supabase query error:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err }
  }
}

/**
 * Get the current authenticated user
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  } catch (err) {
    return { user: null, error: err }
  }
}

/**
 * Check if current user is admin
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  const { user } = await getCurrentUser()
  if (!user) return false
  
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  return data?.is_admin || false
}

export { supabase }
