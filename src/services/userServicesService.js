import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * User Services Service
 * 
 * RLS Policies:
 * - SELECT: Public can view active services (is_active = true)
 * - INSERT: Users can insert their own services (auth.uid() = profile_id)
 * - UPDATE: Users can update their own services (auth.uid() = profile_id)
 * - DELETE: Users can delete their own services (auth.uid() = profile_id)
 */

/**
 * List all active user services
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listActiveUserServices() {
  return executeQuery(
    supabase
      .from('user_services')
      .select(`
        *,
        profile:profiles(*),
        category:service_categories(*),
        location:locations(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
  )
}

/**
 * List user services by category
 * @param {string} categoryId - Category UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listUserServicesByCategory(categoryId) {
  return executeQuery(
    supabase
      .from('user_services')
      .select(`
        *,
        profile:profiles(*),
        category:service_categories(*),
        location:locations(*)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
  )
}

/**
 * List user services by location
 * @param {string} locationId - Location UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listUserServicesByLocation(locationId) {
  return executeQuery(
    supabase
      .from('user_services')
      .select(`
        *,
        profile:profiles(*),
        category:service_categories(*)
      `)
      .eq('location_id', locationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
  )
}

/**
 * List mobile services (services that can be provided at customer location)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listMobileServices() {
  return executeQuery(
    supabase
      .from('user_services')
      .select(`
        *,
        profile:profiles(*),
        category:service_categories(*),
        location:locations(*)
      `)
      .eq('is_active', true)
      .in('service_location_type', ['mobile', 'both'])
      .order('created_at', { ascending: false })
  )
}

/**
 * List user's own services
 * @param {string} userId - User UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listMyUserServices(userId) {
  return executeQuery(
    supabase
      .from('user_services')
      .select(`
        *,
        category:service_categories(*),
        location:locations(*)
      `)
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
  )
}

/**
 * Get a user service by ID
 * @param {string} id - Service UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getUserServiceById(id) {
  return executeQuery(
    supabase
      .from('user_services')
      .select(`
        *,
        profile:profiles(*),
        category:service_categories(*),
        location:locations(*)
      `)
      .eq('id', id)
      .single()
  )
}

/**
 * Create a user service
 * RLS ensures profile_id matches auth.uid()
 * @param {Object} serviceData - Service data
 * @param {string} serviceData.profile_id - Profile UUID (must match auth.uid())
 * @param {string} serviceData.category_id - Category UUID
 * @param {string} [serviceData.description] - Description (max 1000 chars)
 * @param {string} [serviceData.price_range] - Price range
 * @param {string} [serviceData.availability] - Availability schedule
 * @param {string} [serviceData.service_location_type] - Location type (at_provider/mobile/both)
 * @param {string} [serviceData.location_id] - Location UUID
 * @param {string} [serviceData.block] - Block identifier
 * @param {string} [serviceData.lot] - Lot identifier
 * @param {string} [serviceData.facebook_url] - Facebook URL
 * @param {string} [serviceData.photo_1_url] - Photo URL
 * @param {string} [serviceData.photo_2_url] - Photo URL
 * @param {string} [serviceData.photo_3_url] - Photo URL
 * @param {string} [serviceData.photo_4_url] - Photo URL
 * @param {string} [serviceData.photo_5_url] - Photo URL
 * @param {boolean} [serviceData.is_mobile=false] - Deprecated, use service_location_type
 * @param {boolean} [serviceData.is_active=true] - Active status
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createUserService(serviceData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('user_services')
      .insert({
        ...serviceData,
        profile_id: userId
      })
      .select()
      .single()
  )
}

/**
 * Update a user service
 * RLS ensures user owns the service
 * @param {string} id - Service UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateUserService(id, updates) {
  return executeQuery(
    supabase
      .from('user_services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Delete a user service
 * RLS ensures user owns the service
 * @param {string} id - Service UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteUserService(id) {
  return executeQuery(
    supabase
      .from('user_services')
      .delete()
      .eq('id', id)
  )
}
