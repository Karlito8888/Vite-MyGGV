import { supabase, executeQuery } from './baseService'

/**
 * Chat Service (Public Channel Messages)
 * 
 * RLS Policies:
 * - SELECT: Authenticated users can view messages
 * - INSERT: Users can insert their own messages (auth.uid() = user_id)
 * - UPDATE: Users can update their own messages (auth.uid() = user_id)
 * - DELETE: Users can delete their own messages (auth.uid() = user_id)
 */

/**
 * List messages in a channel
 * @param {string} channelId - Channel identifier
 * @param {number} [limit=50] - Number of messages to retrieve
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listChannelMessages(channelId, limit = 50) {
  return executeQuery(
    supabase
      .from('chat')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(limit)
  )
}

/**
 * Get a specific message by ID
 * @param {string} id - Message UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getMessageById(id) {
  return executeQuery(
    supabase
      .from('chat')
      .select(`
        *,
        user:profiles(*),
        reply_to_message:chat!chat_reply_to_fkey(*)
      `)
      .eq('id', id)
      .single()
  )
}

/**
 * Send a message to a channel
 * RLS ensures user_id matches auth.uid()
 * @param {Object} messageData - Message data
 * @param {string} messageData.channel_id - Channel identifier
 * @param {string} messageData.content - Message content
 * @param {string} [messageData.reply_to] - UUID of message being replied to
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function sendMessage(messageData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  return executeQuery(
    supabase
      .from('chat')
      .insert({
        ...messageData,
        user_id: user.id
      })
      .select()
      .single()
  )
}

/**
 * Update a message
 * RLS ensures user owns the message
 * @param {string} id - Message UUID
 * @param {string} content - Updated content
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateMessage(id, content) {
  return executeQuery(
    supabase
      .from('chat')
      .update({
        content,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Delete a message
 * RLS ensures user owns the message
 * @param {string} id - Message UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteMessage(id) {
  return executeQuery(
    supabase
      .from('chat')
      .delete()
      .eq('id', id)
  )
}

/**
 * Subscribe to real-time messages in a channel
 * @param {string} channelId - Channel identifier
 * @param {Function} onMessage - Callback function for new messages
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToChannel(channelId, onMessage) {
  const subscription = supabase
    .channel(`chat:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat',
        filter: `channel_id=eq.${channelId}`
      },
      (payload) => onMessage(payload.new)
    )
    .subscribe()

  return {
    unsubscribe: () => subscription.unsubscribe()
  }
}
