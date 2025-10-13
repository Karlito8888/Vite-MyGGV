import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * Profile Location Associations Service
 * 
 * RLS Policies:
 * - SELECT: Authenticated users can view
 * - INSERT: Authenticated users can insert
 * - UPDATE: Users can update their own associations OR admins can update any
 * - DELETE: Users can delete their own associations OR admins can delete any
 */

/**
 * List all profile location associations
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listProfileLocationAssociations() {
  return executeQuery(
    supabase
      .from('profile_location_associations')
      .select(`
        *,
        profile:profiles(*),
        location:locations(*)
      `)
      .order('id', { ascending: false })
  )
}

/**
 * Get associations for a specific profile
 * @param {string} profileId - Profile UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getProfileAssociations(profileId) {
  return executeQuery(
    supabase
      .from('profile_location_associations')
      .select(`
        *,
        location:locations(*)
      `)
      .eq('profile_id', profileId)
  )
}

/**
 * Get associations for a specific location
 * @param {string} locationId - Location UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getLocationAssociations(locationId) {
  return executeQuery(
    supabase
      .from('profile_location_associations')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('location_id', locationId)
  )
}

/**
 * Get verified owner of a location
 * @param {string} locationId - Location UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getLocationOwner(locationId) {
  return executeQuery(
    supabase
      .from('profile_location_associations')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('location_id', locationId)
      .eq('is_owner', true)
      .eq('is_verified', true)
      .single()
  )
}

/**
 * Create a profile location association
 * @param {Object} associationData - Association data
 * @param {string} associationData.profile_id - Profile UUID
 * @param {string} associationData.location_id - Location UUID
 * @param {boolean} [associationData.is_verified=false] - Verification status
 * @param {boolean} [associationData.is_owner=false] - Owner status
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createProfileLocationAssociation(associationData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('profile_location_associations')
      .insert({
        ...associationData,
        profile_id: userId
      })
      .select()
      .single()
  )
}

/**
 * Update a profile location association
 * RLS ensures user can only update their own OR admin can update any
 * @param {number} id - Association ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateProfileLocationAssociation(id, updates) {
  return executeQuery(
    supabase
      .from('profile_location_associations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Delete a profile location association
 * RLS ensures user can only delete their own OR admin can delete any
 * @param {number} id - Association ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteProfileLocationAssociation(id) {
  return executeQuery(
    supabase
      .from('profile_location_associations')
      .delete()
      .eq('id', id)
  )
}

/**
 * Verify a profile location association (admin only)
 * @param {number} id - Association ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function verifyProfileLocationAssociation(id) {
  return updateProfileLocationAssociation(id, { is_verified: true })
}
