import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * User Business Inside Service
 * 
 * RLS Policies:
 * - SELECT: Public can view active businesses (is_active = true)
 * - INSERT: Users can insert their own businesses (auth.uid() = profile_id)
 * - UPDATE: Users can update their own businesses (auth.uid() = profile_id)
 * - DELETE: Users can delete their own businesses (auth.uid() = profile_id)
 */

/**
 * List all active businesses inside
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listActiveBusinessesInside() {
  return executeQuery(
    supabase
      .from('user_business_inside')
      .select(`
        *,
        profile:profiles(*),
        category:business_inside_categories(*),
        location:locations(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
  )
}

/**
 * List businesses inside by category
 * @param {string} categoryId - Category UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listBusinessesInsideByCategory(categoryId) {
  return executeQuery(
    supabase
      .from('user_business_inside')
      .select(`
        *,
        profile:profiles(*),
        category:business_inside_categories(*),
        location:locations(*)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('business_name', { ascending: true })
  )
}

/**
 * List businesses inside by location
 * @param {string} locationId - Location UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listBusinessesInsideByLocation(locationId) {
  return executeQuery(
    supabase
      .from('user_business_inside')
      .select(`
        *,
        profile:profiles(*),
        category:business_inside_categories(*)
      `)
      .eq('location_id', locationId)
      .eq('is_active', true)
      .order('business_name', { ascending: true })
  )
}

/**
 * List user's own businesses inside
 * @param {string} userId - User UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listMyBusinessesInside(userId) {
  return executeQuery(
    supabase
      .from('user_business_inside')
      .select(`
        *,
        category:business_inside_categories(*),
        location:locations(*)
      `)
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
  )
}

/**
 * Get a business inside by ID
 * @param {string} id - Business UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getBusinessInsideById(id) {
  return executeQuery(
    supabase
      .from('user_business_inside')
      .select(`
        *,
        profile:profiles(*),
        category:business_inside_categories(*),
        location:locations(*)
      `)
      .eq('id', id)
      .single()
  )
}

/**
 * Create a business inside
 * RLS ensures profile_id matches auth.uid()
 * @param {Object} businessData - Business data
 * @param {string} businessData.profile_id - Profile UUID (must match auth.uid())
 * @param {string} businessData.category_id - Category UUID
 * @param {string} businessData.business_name - Business name (2-100 chars)
 * @param {string} [businessData.description] - Description (max 1000 chars)
 * @param {string} [businessData.email] - Email
 * @param {string} [businessData.phone_number] - Phone number
 * @param {string} [businessData.phone_type] - Phone type (landline/mobile/viber/whatsapp)
 * @param {string} [businessData.website_url] - Website URL
 * @param {string} [businessData.facebook_url] - Facebook URL
 * @param {string} [businessData.hours] - Business hours
 * @param {string} [businessData.location_id] - Location UUID
 * @param {string} [businessData.block] - Block identifier
 * @param {string} [businessData.lot] - Lot identifier
 * @param {string} [businessData.photo_1_url] - Photo URL
 * @param {string} [businessData.photo_2_url] - Photo URL
 * @param {string} [businessData.photo_3_url] - Photo URL
 * @param {string} [businessData.photo_4_url] - Photo URL
 * @param {string} [businessData.photo_5_url] - Photo URL
 * @param {boolean} [businessData.is_active=true] - Active status
 * @param {boolean} [businessData.is_featured=false] - Featured status
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createBusinessInside(businessData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('user_business_inside')
      .insert({
        ...businessData,
        profile_id: userId
      })
      .select()
      .single()
  )
}

/**
 * Update a business inside
 * RLS ensures user owns the business
 * @param {string} id - Business UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateBusinessInside(id, updates) {
  return executeQuery(
    supabase
      .from('user_business_inside')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Delete a business inside
 * RLS ensures user owns the business
 * @param {string} id - Business UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteBusinessInside(id) {
  return executeQuery(
    supabase
      .from('user_business_inside')
      .delete()
      .eq('id', id)
  )
}

/**
 * Search businesses inside by name
 * @param {string} searchTerm - Search term
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function searchBusinessesInside(searchTerm) {
  return executeQuery(
    supabase
      .from('user_business_inside')
      .select(`
        *,
        profile:profiles(*),
        category:business_inside_categories(*),
        location:locations(*)
      `)
      .eq('is_active', true)
      .ilike('business_name', `%${searchTerm}%`)
      .order('business_name', { ascending: true })
  )
}
