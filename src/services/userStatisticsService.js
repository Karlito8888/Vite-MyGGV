import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * User Statistics Service
 * 
 * RLS Policies:
 * - SELECT: Users can view their own statistics (auth.uid() = user_id)
 *          Admins can view all statistics
 * - INSERT/UPDATE/DELETE: Managed by database triggers (not directly accessible)
 */

/**
 * Get statistics for a specific user
 * RLS ensures user can only view their own stats (or admin can view all)
 * @param {string} userId - User UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getUserStatistics(userId) {
  return executeQuery(
    supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single()
  )
}

/**
 * Get statistics for the current authenticated user
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getCurrentUserStatistics() {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }
  return getUserStatistics(userId)
}

/**
 * Get all user statistics (admin only)
 * RLS will enforce admin access
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listAllUserStatistics() {
  return executeQuery(
    supabase
      .from('user_statistics')
      .select('*')
      .order('last_activity_at', { ascending: false })
  )
}

/**
 * Get top users by a specific metric
 * @param {string} metric - Metric name (e.g., 'total_messages', 'total_marketplace_listings')
 * @param {number} [limit=10] - Number of results to return
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getTopUsersByMetric(metric, limit = 10) {
  return executeQuery(
    supabase
      .from('user_statistics')
      .select('*')
      .order(metric, { ascending: false })
      .limit(limit)
  )
}
