import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * Profiles Service
 * 
 * RLS Policies:
 * - SELECT: Public access (anyone can view profiles)
 * - INSERT: Users can insert their own profile (auth.uid() = id)
 * - UPDATE: Users can update their own profile (auth.uid() = id)
 * - DELETE: Users can delete their own profile (auth.uid() = id)
 */

/**
 * List all profiles (excluding deleted)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listProfiles() {
  return executeQuery(
    supabase
      .from('profiles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
  )
}

/**
 * Get a profile by ID
 * @param {string} id - Profile UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getProfileById(id) {
  return executeQuery(
    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
  )
}

/**
 * Get a profile by username
 * @param {string} username - Username
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getProfileByUsername(username) {
  return executeQuery(
    supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .is('deleted_at', null)
      .single()
  )
}

/**
 * Get the current user's profile
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getCurrentUserProfile() {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }
  return getProfileById(userId)
}

/**
 * Create a new profile
 * RLS ensures the profile ID matches the authenticated user
 * @param {Object} profileData - Profile data
 * @param {string} profileData.id - User UUID (must match auth.uid())
 * @param {string} [profileData.full_name] - Full name (max 100 chars)
 * @param {string} [profileData.username] - Username (min 3 chars, unique)
 * @param {string} [profileData.email] - Email (unique, validated)
 * @param {string} [profileData.avatar_url] - Avatar URL
 * @param {string} [profileData.description] - Bio (max 700 chars)
 * @param {string} [profileData.occupation] - Occupation
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createProfile(profileData) {
  return executeQuery(
    supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()
  )
}

/**
 * Update a profile
 * RLS ensures user can only update their own profile
 * @param {string} id - Profile UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateProfile(id, updates) {
  return executeQuery(
    supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Soft delete a profile
 * RLS ensures user can only delete their own profile
 * @param {string} id - Profile UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteProfile(id) {
  return executeQuery(
    supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Complete onboarding for a profile
 * @param {string} id - Profile UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function completeOnboarding(id) {
  return executeQuery(
    supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Update daily check-in timestamp
 * @param {string} id - Profile UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateDailyCheckin(id) {
  return executeQuery(
    supabase
      .from('profiles')
      .update({ last_daily_checkin: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  )
}
