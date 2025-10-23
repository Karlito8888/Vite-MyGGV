import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * Business Outside Categories Service
 * 
 * RLS Policies:
 * - SELECT: Public access (anyone can view)
 * - INSERT: Authenticated users only
 * - UPDATE: Authenticated users only
 * - DELETE: Not implemented (categories should not be deleted)
 */

/**
 * List all active business outside categories
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listBusinessOutsideCategories() {
  return executeQuery(
    supabase
      .from('business_outside_categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
  )
}

/**
 * List all business outside categories (including inactive)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listAllBusinessOutsideCategories() {
  return executeQuery(
    supabase
      .from('business_outside_categories')
      .select('*')
      .order('name', { ascending: true })
  )
}

/**
 * Get a business outside category by ID
 * @param {string} id - Category UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getBusinessOutsideCategoryById(id) {
  return executeQuery(
    supabase
      .from('business_outside_categories')
      .select('*')
      .eq('id', id)
      .single()
  )
}

/**
 * Create a new business outside category
 * Requires authentication (enforced by RLS)
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.name - Category name (2-100 chars, unique)
 * @param {string} [categoryData.description] - Category description
 * @param {string} [categoryData.icon] - Icon identifier
 * @param {boolean} [categoryData.is_active=true] - Active status
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createBusinessOutsideCategory(categoryData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('business_outside_categories')
      .insert(categoryData)
      .select()
      .single()
  )
}

/**
 * Update a business outside category
 * Requires authentication (enforced by RLS)
 * @param {string} id - Category UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateBusinessOutsideCategory(id, updates) {
  return executeQuery(
    supabase
      .from('business_outside_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  )
}
