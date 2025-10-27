import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * User Business Outside Service
 * 
 * RLS Policies:
 * - SELECT: Public can view active businesses (is_active = true)
 * - INSERT: Users can insert their own businesses (auth.uid() = profile_id)
 * - UPDATE: Users can update their own businesses (auth.uid() = profile_id)
 * - DELETE: Users can delete their own businesses (auth.uid() = profile_id)
 */

/**
 * List all active businesses outside
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listActiveBusinessesOutside() {
  return executeQuery(
    supabase
      .from('user_business_outside')
      .select(`
        *,
        profile:profiles(*),
        category:business_outside_categories(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
  )
}

/**
 * List businesses outside by category
 * @param {string} categoryId - Category UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listBusinessesOutsideByCategory(categoryId) {
  return executeQuery(
    supabase
      .from('user_business_outside')
      .select(`
        *,
        profile:profiles(*),
        category:business_outside_categories(*)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('business_name', { ascending: true })
  )
}

/**
 * List businesses outside by city
 * @param {string} city - City name
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listBusinessesOutsideByCity(city) {
  return executeQuery(
    supabase
      .from('user_business_outside')
      .select(`
        *,
        profile:profiles(*),
        category:business_outside_categories(*)
      `)
      .eq('city', city)
      .eq('is_active', true)
      .order('business_name', { ascending: true })
  )
}

/**
 * List user's own businesses outside
 * @param {string} userId - User UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listMyBusinessesOutside(userId) {
  return executeQuery(
    supabase
      .from('user_business_outside')
      .select(`
        *,
        category:business_outside_categories(*)
      `)
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
  )
}

/**
 * Get a business outside by ID
 * @param {string} id - Business UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getBusinessOutsideById(id) {
  return executeQuery(
    supabase
      .from('user_business_outside')
      .select(`
        *,
        profile:profiles(*),
        category:business_outside_categories(*)
      `)
      .eq('id', id)
      .single()
  )
}

/**
 * Create a business outside
 * RLS ensures profile_id matches auth.uid()
 * @param {Object} businessData - Business data
 * @param {string} businessData.profile_id - Profile UUID (must match auth.uid())
 * @param {string} businessData.category_id - Category UUID
 * @param {string} businessData.business_name - Business name (2-100 chars)
 * @param {string} [businessData.description] - Description (max 1000 chars)
 * @param {string} [businessData.email] - Email
 * @param {string} [businessData.website_url] - Website URL
 * @param {string} [businessData.facebook_url] - Facebook URL
 * @param {string} [businessData.messenger_url] - Facebook Messenger URL
 * @param {string} [businessData.viber_number] - Viber contact number
 * @param {string} [businessData.whatsapp_number] - WhatsApp contact number
 * @param {string} [businessData.tiktok_url] - TikTok profile URL
 * @param {string} [businessData.instagram_url] - Instagram profile URL
 * @param {string} [businessData.address] - Street address
 * @param {string} [businessData.barangay] - Barangay
 * @param {string} [businessData.city] - City
 * @param {string} [businessData.province] - Province
 * @param {string} [businessData.postal_code] - Postal code
 * @param {string} [businessData.google_maps_link] - Google Maps link
 * @param {string} [businessData.availability] - Business availability schedule
 * @param {string} [businessData.photo_1_url] - Photo URL
 * @param {string} [businessData.photo_2_url] - Photo URL
 * @param {string} [businessData.photo_3_url] - Photo URL
 * @param {string} [businessData.photo_4_url] - Photo URL
 * @param {string} [businessData.photo_5_url] - Photo URL
 * @param {string} [businessData.photo_6_url] - Photo URL
 * @param {boolean} [businessData.is_active=true] - Active status
 * @param {boolean} [businessData.is_featured=false] - Featured status
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createBusinessOutside(businessData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('user_business_outside')
      .insert({
        ...businessData,
        profile_id: userId
      })
      .select()
      .single()
  )
}

/**
 * Update a business outside
 * RLS ensures user owns the business
 * @param {string} id - Business UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateBusinessOutside(id, updates) {
  return executeQuery(
    supabase
      .from('user_business_outside')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Delete a business outside
 * RLS ensures user owns the business
 * @param {string} id - Business UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteBusinessOutside(id) {
  return executeQuery(
    supabase
      .from('user_business_outside')
      .delete()
      .eq('id', id)
  )
}

/**
 * Search businesses outside by name
 * @param {string} searchTerm - Search term
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function searchBusinessesOutside(searchTerm) {
  return executeQuery(
    supabase
      .from('user_business_outside')
      .select(`
        *,
        profile:profiles(*),
        category:business_outside_categories(*)
      `)
      .eq('is_active', true)
      .ilike('business_name', `%${searchTerm}%`)
      .order('business_name', { ascending: true })
  )
}
