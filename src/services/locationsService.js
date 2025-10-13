import { supabase, executeQuery } from './baseService'

/**
 * Locations Service
 * 
 * RLS Policies:
 * - SELECT: Public access (anyone can view)
 * - INSERT: Admin only
 * - UPDATE: Admin only
 * - DELETE: Admin only
 */

/**
 * List all locations (excluding deleted)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listLocations() {
  return executeQuery(
    supabase
      .from('locations')
      .select('*')
      .is('deleted_at', null)
      .order('block', { ascending: true })
  )
}

/**
 * Get a location by ID
 * @param {string} id - Location UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getLocationById(id) {
  return executeQuery(
    supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
  )
}

/**
 * Get a location by block and lot
 * @param {string} block - Block identifier
 * @param {string} lot - Lot identifier
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getLocationByBlockLot(block, lot) {
  return executeQuery(
    supabase
      .from('locations')
      .select('*')
      .eq('block', block)
      .eq('lot', lot)
      .is('deleted_at', null)
      .single()
  )
}

/**
 * Search locations by block or lot
 * @param {string} searchTerm - Search term
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function searchLocations(searchTerm) {
  return executeQuery(
    supabase
      .from('locations')
      .select('*')
      .is('deleted_at', null)
      .or(`block.ilike.%${searchTerm}%,lot.ilike.%${searchTerm}%`)
      .order('block', { ascending: true })
  )
}

/**
 * Create a new location
 * Requires admin privileges (enforced by RLS)
 * @param {Object} locationData - Location data
 * @param {string} locationData.block - Block identifier
 * @param {string} locationData.lot - Lot identifier
 * @param {Object} [locationData.coordinates] - PostGIS geometry coordinates
 * @param {boolean} [locationData.is_locked=false] - Lock status
 * @param {string} [locationData.marker_url] - Custom marker URL
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createLocation(locationData) {
  return executeQuery(
    supabase
      .from('locations')
      .insert(locationData)
      .select()
      .single()
  )
}

/**
 * Update a location
 * Requires admin privileges (enforced by RLS)
 * @param {string} id - Location UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateLocation(id, updates) {
  return executeQuery(
    supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Soft delete a location
 * Requires admin privileges (enforced by RLS)
 * @param {string} id - Location UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteLocation(id) {
  return executeQuery(
    supabase
      .from('locations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Lock/unlock a location
 * Requires admin privileges (enforced by RLS)
 * @param {string} id - Location UUID
 * @param {boolean} isLocked - Lock status
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function setLocationLock(id, isLocked) {
  return executeQuery(
    supabase
      .from('locations')
      .update({ is_locked: isLocked })
      .eq('id', id)
      .select()
      .single()
  )
}
