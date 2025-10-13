import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * Messages Header Service (Pinned/Featured Messages)
 * 
 * RLS Policies:
 * - SELECT: Public access (anyone can view)
 * - INSERT: Authenticated users can insert
 * - UPDATE: Users can update their own messages (auth.uid() = user_id)
 * - DELETE: Users can delete their own messages (auth.uid() = user_id)
 */

/**
 * List all active header messages (not expired)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listActiveHeaderMessages() {
  const now = new Date().toISOString()
  
  return executeQuery(
    supabase
      .from('messages_header')
      .select(`
        *,
        user:profiles(*)
      `)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })
  )
}

/**
 * List all header messages (including expired)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listAllHeaderMessages() {
  return executeQuery(
    supabase
      .from('messages_header')
      .select(`
        *,
        user:profiles(*)
      `)
      .order('created_at', { ascending: false })
  )
}

/**
 * Get a header message by ID
 * @param {string} id - Message UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getHeaderMessageById(id) {
  return executeQuery(
    supabase
      .from('messages_header')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('id', id)
      .single()
  )
}

/**
 * Create a header message
 * @param {Object} messageData - Message data
 * @param {string} messageData.message - Message content
 * @param {number} [messageData.coins_spent=0] - Coins spent for this message
 * @param {string} [messageData.expires_at] - Expiration timestamp
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createHeaderMessage(messageData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('messages_header')
      .insert({
        ...messageData,
        user_id: userId
      })
      .select()
      .single()
  )
}

/**
 * Update a header message
 * RLS ensures user owns the message
 * @param {string} id - Message UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateHeaderMessage(id, updates) {
  return executeQuery(
    supabase
      .from('messages_header')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Delete a header message
 * RLS ensures user owns the message
 * @param {string} id - Message UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteHeaderMessage(id) {
  return executeQuery(
    supabase
      .from('messages_header')
      .delete()
      .eq('id', id)
  )
}

/**
 * Extend expiration of a header message
 * @param {string} id - Message UUID
 * @param {number} daysToAdd - Number of days to add to expiration
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function extendHeaderMessageExpiration(id, daysToAdd) {
  const { data: message } = await getHeaderMessageById(id)
  if (!message) {
    return { data: null, error: new Error('Message not found') }
  }

  const currentExpiration = message.expires_at ? new Date(message.expires_at) : new Date()
  const newExpiration = new Date(currentExpiration.getTime() + daysToAdd * 24 * 60 * 60 * 1000)

  return updateHeaderMessage(id, { expires_at: newExpiration.toISOString() })
}
