import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * Business Inside Categories Service
 * 
 * RLS Policies:
 * - SELECT: Public access (anyone can view)
 * - INSERT: Authenticated users only
 * - UPDATE: Authenticated users only
 * - DELETE: Not implemented (categories should not be deleted)
 */

/**
 * List all active business inside categories
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listBusinessInsideCategories() {
  return executeQuery(
    supabase
      .from('business_inside_categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
  )
}

/**
 * List all business inside categories (including inactive)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listAllBusinessInsideCategories() {
  return executeQuery(
    supabase
      .from('business_inside_categories')
      .select('*')
      .order('name', { ascending: true })
  )
}

/**
 * Get a business inside category by ID
 * @param {string} id - Category UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getBusinessInsideCategoryById(id) {
  return executeQuery(
    supabase
      .from('business_inside_categories')
      .select('*')
      .eq('id', id)
      .single()
  )
}

/**
 * Create a new business inside category
 * Requires authentication (enforced by RLS)
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.name - Category name (2-100 chars, unique)
 * @param {string} [categoryData.description] - Category description
 * @param {string} [categoryData.icon] - Icon identifier
 * @param {boolean} [categoryData.is_active=true] - Active status
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createBusinessInsideCategory(categoryData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('business_inside_categories')
      .insert({
        ...categoryData,
        created_by: userId
      })
      .select()
      .single()
  )
}

/**
 * Update a business inside category
 * Requires authentication (enforced by RLS)
 * @param {string} id - Category UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateBusinessInsideCategory(id, updates) {
  return executeQuery(
    supabase
      .from('business_inside_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  )
}
