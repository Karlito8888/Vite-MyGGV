import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * Marketplace Listings Service
 * 
 * RLS Policies:
 * - SELECT: Public can view active listings OR users can view their own listings (including expired)
 * - INSERT: Users can create their own listings (auth.uid() = profile_id)
 * - UPDATE: Users can update their own listings (auth.uid() = profile_id)
 * - DELETE: Users can delete their own listings (auth.uid() = profile_id)
 * - ALL: Admins can manage all listings
 */

/**
 * List all active marketplace listings
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listActiveListings() {
  return executeQuery(
    supabase
      .from('marketplace_listings')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('is_active', true)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
  )
}

/**
 * List marketplace listings by type
 * @param {string} listingType - Listing type ('selling' or 'buying')
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listListingsByType(listingType) {
  return executeQuery(
    supabase
      .from('marketplace_listings')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('is_active', true)
      .eq('listing_type', listingType)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
  )
}

/**
 * List marketplace listings by category
 * @param {string} category - Category name
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listListingsByCategory(category) {
  return executeQuery(
    supabase
      .from('marketplace_listings')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('is_active', true)
      .eq('category', category)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
  )
}

/**
 * List featured marketplace listings
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listFeaturedListings() {
  return executeQuery(
    supabase
      .from('marketplace_listings')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
  )
}

/**
 * List user's own marketplace listings
 * @param {string} userId - User UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listMyListings(userId) {
  return executeQuery(
    supabase
      .from('marketplace_listings')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
  )
}

/**
 * Get a marketplace listing by ID
 * @param {string} id - Listing UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getListingById(id) {
  return executeQuery(
    supabase
      .from('marketplace_listings')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('id', id)
      .single()
  )
}

/**
 * Create a marketplace listing
 * RLS ensures profile_id matches auth.uid()
 * @param {Object} listingData - Listing data
 * @param {string} listingData.profile_id - Profile UUID (must match auth.uid())
 * @param {string} listingData.title - Listing title (2-100 chars)
 * @param {string} [listingData.description] - Description (max 1000 chars)
 * @param {number} [listingData.price] - Price (>= 0)
 * @param {string} [listingData.currency='PHP'] - Currency (PHP or USD)
 * @param {string} listingData.listing_type - Type ('selling' or 'buying')
 * @param {string} [listingData.category] - Category
 * @param {string} [listingData.location_description] - Location description
 * @param {string} [listingData.contact_method] - Contact method (phone/message/both)
 * @param {string} [listingData.photo_1_url] - Photo URL
 * @param {string} [listingData.photo_2_url] - Photo URL
 * @param {string} [listingData.photo_3_url] - Photo URL
 * @param {string} [listingData.photo_4_url] - Photo URL
 * @param {string} [listingData.photo_5_url] - Photo URL
 * @param {boolean} [listingData.is_active=true] - Active status
 * @param {boolean} [listingData.is_featured=false] - Featured status
 * @param {string} [listingData.status='available'] - Status (available/pending/sold/expired)
 * @param {string} [listingData.expires_at] - Expiration date
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createListing(listingData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('marketplace_listings')
      .insert({
        ...listingData,
        profile_id: userId
      })
      .select()
      .single()
  )
}

/**
 * Update a marketplace listing
 * RLS ensures user owns the listing
 * @param {string} id - Listing UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateListing(id, updates) {
  return executeQuery(
    supabase
      .from('marketplace_listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Delete a marketplace listing
 * RLS ensures user owns the listing
 * @param {string} id - Listing UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteListing(id) {
  return executeQuery(
    supabase
      .from('marketplace_listings')
      .delete()
      .eq('id', id)
  )
}

/**
 * Mark a listing as sold
 * @param {string} id - Listing UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function markListingAsSold(id) {
  return updateListing(id, { status: 'sold' })
}

/**
 * Mark a listing as pending
 * @param {string} id - Listing UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function markListingAsPending(id) {
  return updateListing(id, { status: 'pending' })
}

/**
 * Reactivate a listing
 * @param {string} id - Listing UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function reactivateListing(id) {
  return updateListing(id, { status: 'available', is_active: true })
}

/**
 * Search marketplace listings by title or description
 * @param {string} searchTerm - Search term
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function searchListings(searchTerm) {
  return executeQuery(
    supabase
      .from('marketplace_listings')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('is_active', true)
      .eq('status', 'available')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
  )
}
