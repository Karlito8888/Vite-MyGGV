import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * Conversation Cleanup Notifications Service
 * 
 * RLS Policies:
 * - SELECT: Users can view their own notifications (auth.uid() = user_id)
 * - INSERT: Admins can insert cleanup notifications
 * - UPDATE: Users can update their own notifications (auth.uid() = user_id)
 * - DELETE: Users can delete their own notifications (auth.uid() = user_id)
 * - ALL: Admins can manage all notifications
 */

/**
 * Get cleanup notifications for current user
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getMyCleanupNotifications() {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('conversation_cleanup_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('notification_sent_at', { ascending: false })
  )
}

/**
 * Get unacknowledged cleanup notifications for current user
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getUnacknowledgedNotifications() {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('conversation_cleanup_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_acknowledged', false)
      .order('notification_sent_at', { ascending: false })
  )
}

/**
 * Create a cleanup notification (admin only)
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.user_id - User UUID
 * @param {string} notificationData.cleanup_scheduled_at - Scheduled cleanup timestamp
 * @param {number} notificationData.conversations_count - Number of conversations to be cleaned
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createCleanupNotification(notificationData) {
  return executeQuery(
    supabase
      .from('conversation_cleanup_notifications')
      .insert({
        ...notificationData,
        notification_sent_at: new Date().toISOString()
      })
      .select()
      .single()
  )
}

/**
 * Acknowledge a cleanup notification
 * @param {string} id - Notification UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function acknowledgeCleanupNotification(id) {
  return executeQuery(
    supabase
      .from('conversation_cleanup_notifications')
      .update({ is_acknowledged: true })
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Delete a cleanup notification
 * RLS ensures user owns the notification
 * @param {string} id - Notification UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteCleanupNotification(id) {
  return executeQuery(
    supabase
      .from('conversation_cleanup_notifications')
      .delete()
      .eq('id', id)
  )
}

/**
 * Get all cleanup notifications (admin only)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listAllCleanupNotifications() {
  return executeQuery(
    supabase
      .from('conversation_cleanup_notifications')
      .select(`
        *,
        user:profiles(*)
      `)
      .order('notification_sent_at', { ascending: false })
  )
}
