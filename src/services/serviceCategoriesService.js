import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * Service Categories Service
 * 
 * RLS Policies:
 * - SELECT: Public access (anyone can view)
 * - INSERT: Authenticated users only
 * - DELETE: Not implemented (categories should not be deleted)
 */

/**
 * List all active service categories
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listServiceCategories() {
  return executeQuery(
    supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
  )
}

/**
 * List all service categories (including inactive)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listAllServiceCategories() {
  return executeQuery(
    supabase
      .from('service_categories')
      .select('*')
      .order('name', { ascending: true })
  )
}

/**
 * Get a service category by ID
 * @param {string} id - Category UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getServiceCategoryById(id) {
  return executeQuery(
    supabase
      .from('service_categories')
      .select('*')
      .eq('id', id)
      .single()
  )
}

/**
 * Create a new service category
 * Requires authentication (enforced by RLS)
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.name - Category name (2-100 chars, unique)
 * @param {string} [categoryData.description] - Category description
 * @param {string} [categoryData.icon] - Icon identifier
 * @param {boolean} [categoryData.is_active=true] - Active status
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createServiceCategory(categoryData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('service_categories')
      .insert(categoryData)
      .select()
      .single()
  )
}
