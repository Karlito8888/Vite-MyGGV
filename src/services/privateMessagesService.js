import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * Private Messages Service
 * 
 * RLS Policies:
 * - SELECT: Users can view messages where they are sender or receiver
 * - INSERT: Users can send messages (auth.uid() = sender_id)
 * - UPDATE: Users can update their sent messages (auth.uid() = sender_id)
 * - DELETE: Users can delete their sent messages (auth.uid() = sender_id)
 */

/**
 * Get conversation messages between two users
 * @param {string} userId - Current user UUID
 * @param {string} otherUserId - Other user UUID
 * @param {number} [limit=50] - Number of messages to retrieve
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getConversationMessages(userId, otherUserId, limit = 50) {
  return executeQuery(
    supabase
      .from('private_messages')
      .select(`
        *,
        sender:profiles!private_messages_sender_id_fkey(*),
        receiver:profiles!private_messages_receiver_id_fkey(*),
        reply_to_message:private_messages!private_messages_reply_to_fkey(*)
      `)
      .is('deleted_at', null)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(limit)
  )
}

/**
 * Get all conversations for a user (list of unique conversation partners)
 * @param {string} userId - User UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getUserConversations(userId) {
  return executeQuery(
    supabase
      .rpc('get_user_conversations', { user_id: userId })
  )
}

/**
 * Get unread message count for a user
 * @param {string} userId - User UUID (receiver)
 * @returns {Promise<{data: number|null, error: Error|null}>}
 */
export async function getUnreadMessageCount(userId) {
  const { data, error } = await executeQuery(
    supabase
      .from('private_messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .is('read_at', null)
      .is('deleted_at', null)
  )
  
  return { data: data?.length || 0, error }
}

/**
 * Send a private message
 * RLS ensures sender_id matches auth.uid()
 * @param {Object} messageData - Message data
 * @param {string} messageData.receiver_id - Receiver UUID
 * @param {string} messageData.message - Message content
 * @param {string} [messageData.message_type='text'] - Message type (text/image/file/location)
 * @param {string} [messageData.attachment_url] - Attachment URL
 * @param {string} [messageData.attachment_type] - Attachment type
 * @param {string} [messageData.reply_to] - UUID of message being replied to
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function sendPrivateMessage(messageData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('private_messages')
      .insert({
        ...messageData,
        sender_id: userId
      })
      .select()
      .single()
  )
}

/**
 * Mark a message as read
 * @param {string} messageId - Message UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function markMessageAsRead(messageId) {
  return executeQuery(
    supabase
      .from('private_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .select()
      .single()
  )
}

/**
 * Mark all messages from a user as read
 * @param {string} senderId - Sender UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function markConversationAsRead(senderId) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('private_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', senderId)
      .eq('receiver_id', userId)
      .is('read_at', null)
      .select()
  )
}

/**
 * Update a private message
 * RLS ensures user is the sender
 * @param {string} id - Message UUID
 * @param {string} message - Updated message content
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updatePrivateMessage(id, message) {
  return executeQuery(
    supabase
      .from('private_messages')
      .update({
        message,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Soft delete a private message
 * RLS ensures user is the sender
 * @param {string} messageId - Message UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deletePrivateMessage(messageId) {
  return executeQuery(
    supabase
      .from('private_messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId)
      .select()
      .single()
  )
}

/**
 * Subscribe to real-time private messages for a user
 * @param {string} userId - User UUID
 * @param {Function} onMessage - Callback function for new messages
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToPrivateMessages(userId, onMessage) {
  const subscription = supabase
    .channel(`private_messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'private_messages',
        filter: `receiver_id=eq.${userId}`
      },
      (payload) => onMessage(payload.new)
    )
    .subscribe()

  return {
    unsubscribe: () => subscription.unsubscribe()
  }
}
