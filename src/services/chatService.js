import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'
import { realtimeManager } from './realtimeManager'

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
 * Upload an image to chat storage
 * @param {File} file - Image file to upload
 * @param {string} channelId - Channel identifier
 * @returns {Promise<{data: {url: string, path: string}|null, error: Error|null}>}
 */
export async function uploadChatImage(file, channelId) {
  const { userId, error: authError } = await getAuthenticatedUserId()
  if (authError) {
    return { data: null, error: authError }
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      data: null,
      error: new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
    }
  }

  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      data: null,
      error: new Error('File too large. Maximum size is 5MB.')
    }
  }

  // Create unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${channelId}/${Date.now()}.${fileExt}`

  // Upload to storage
  const { data, error } = await supabase.storage
    .from('chat-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    return { data: null, error }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('chat-images')
    .getPublicUrl(data.path)

  return {
    data: {
      url: publicUrl,
      path: data.path
    },
    error: null
  }
}

/**
 * Send a message to a channel
 * RLS ensures user_id matches auth.uid()
 * @param {Object} messageData - Message data
 * @param {string} messageData.channel_id - Channel identifier
 * @param {string} messageData.content - Message content
 * @param {string} [messageData.reply_to] - UUID of message being replied to
 * @param {string} [messageData.attachment_url] - URL to uploaded file
 * @param {string} [messageData.attachment_type] - MIME type of attachment
 * @param {string} [messageData.message_type] - Type: 'text', 'image', 'file'
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function sendMessage(messageData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('chat')
      .insert({
        ...messageData,
        user_id: userId
      })
      .select()
      .single()
  )
}

/**
 * Send an image message
 * @param {Object} params - Parameters
 * @param {string} params.channel_id - Channel identifier
 * @param {File} params.image - Image file to upload
 * @param {string} [params.content] - Optional caption
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function sendImageMessage({ channel_id, image, content = '' }) {
  // Upload image first
  const { data: uploadData, error: uploadError } = await uploadChatImage(image, channel_id)

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  // Send message with image
  return sendMessage({
    channel_id,
    content: content || '📷 Image',
    attachment_url: uploadData.url,
    attachment_type: image.type,
    message_type: 'image'
  })
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
 * Subscribe to real-time messages in a channel using centralized manager
 * Listens to INSERT, UPDATE, and DELETE events
 * @param {string} channelId - Channel identifier
 * @param {Object} callbacks - Callback functions for different events
 * @param {Function} callbacks.onInsert - Callback for new messages
 * @param {Function} [callbacks.onUpdate] - Callback for updated messages
 * @param {Function} [callbacks.onDelete] - Callback for deleted messages
 * @returns {Promise<Object>} Subscription object with unsubscribe method
 */
export async function subscribeToChannel(channelId, callbacks) {
  const { onInsert, onUpdate, onDelete } = callbacks
  const channelName = realtimeManager.getStandardChannelName('chat', channelId)

  console.log('[REALTIME] 🔌 Subscribing to chat channel (service):', channelName)

  const setupChatChannel = (channel) => {
    // Listen to INSERT events
    if (onInsert) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          // Fetch profile data for new message
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url, full_name')
            .eq('id', payload.new.user_id)
            .single()

          onInsert({
            ...payload.new,
            profiles: profileData
          })
        }
      )
    }

    // Listen to UPDATE events
    if (onUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => onUpdate(payload.new)
      )
    }

    // Listen to DELETE events
    if (onDelete) {
      channel.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => onDelete(payload.old)
      )
    }
  }

  try {
    const channel = await realtimeManager.subscribeStandard(
      'chat',
      setupChatChannel,
      [channelId],
      channelId
    )

    return {
      channel,
      unsubscribe: () => {
        console.log('[REALTIME] 🔌 Unsubscribing from chat channel (service):', channelName)
        realtimeManager.unsubscribe(channelName, [channelId])
      }
    }
  } catch (error) {
    console.error('[CHAT-SERVICE] ❌ Failed to subscribe to channel:', error)
    throw error
  }
}

/**
 * Subscribe to real-time updates for a specific chat channel
 * 
 * This function uses the centralized realtimeManager to prevent duplicate
 * subscriptions and provide automatic retry logic.
 * 
 * @param {string} channelId - Channel identifier
 * @param {Object} callbacks - Callback functions for different events
 * @param {Function} callbacks.onInsert - Callback for new messages (required)
 * @param {Function} [callbacks.onUpdate] - Callback for updated messages
 * @param {Function} [callbacks.onDelete] - Callback for deleted messages
 * @returns {Promise<Object>} Subscription object with unsubscribe method
 * 
 * Usage Example:
 * ```javascript
 * const subscription = await subscribeToChannel('general', {
 *   onInsert: (payload) => {
 *     console.log('New message:', payload.new)
 *     // Update UI with new message
 *   },
 *   onUpdate: (payload) => {
 *     console.log('Message updated:', payload.new)
 *     // Update UI with edited message
 *   }
 * })
 * 
 * // Cleanup on unmount
 * useEffect(() => {
 *   return () => {
 *     if (subscription) {
 *       subscription.unsubscribe()
 *     }
 *   }
 * }, [])
 * ```
 */
export async function getChannelMessageCount(channelId) {
  const { count, error } = await supabase
    .from('chat')
    .select('*', { count: 'exact', head: true })
    .eq('channel_id', channelId)

  return { data: count, error }
}

/**
 * Search messages in a channel
 * @param {string} channelId - Channel identifier
 * @param {string} searchTerm - Search term
 * @param {number} [limit=20] - Number of results
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function searchChannelMessages(channelId, searchTerm, limit = 20) {
  return executeQuery(
    supabase
      .from('chat')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('channel_id', channelId)
      .ilike('content', `%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(limit)
  )
}
