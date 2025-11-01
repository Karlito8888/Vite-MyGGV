import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'
import { realtimeManager } from './realtimeManager'

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
        receiver:profiles!private_messages_receiver_id_fkey(*)
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
 * Delete a private message
 * RLS ensures user is the sender
 * @param {string} messageId - Message UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deletePrivateMessage(messageId) {
  return executeQuery(
    supabase
      .from('private_messages')
      .delete()
      .eq('id', messageId)
  )
}

/**
 * Delete entire conversation with a user
 * Deletes all messages where current user is sender or receiver
 * @param {string} userId - Current user UUID
 * @param {string} otherUserId - Other user UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteConversation(userId, otherUserId) {
  return executeQuery(
    supabase
      .from('private_messages')
      .delete()
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
  )
}

/**
 * Upload an image to private messages storage
 * @param {File} file - Image file to upload
 * @param {string} receiverId - Receiver UUID
 * @returns {Promise<{data: {url: string, path: string}|null, error: Error|null}>}
 */
export async function uploadPrivateMessageImage(file, receiverId) {
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
  const fileName = `${userId}/${receiverId}/${Date.now()}.${fileExt}`

  // Upload to storage
  const { data, error } = await supabase.storage
    .from('private-messages-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    return { data: null, error }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('private-messages-images')
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
 * Send an image message
 * @param {Object} params - Parameters
 * @param {string} params.receiver_id - Receiver UUID
 * @param {File} params.image - Image file to upload
 * @param {string} [params.message] - Optional caption
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function sendPrivateImageMessage({ receiver_id, image, message = '' }) {
  // Upload image first
  const { data: uploadData, error: uploadError } = await uploadPrivateMessageImage(image, receiver_id)

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  // Send message with image
  return sendPrivateMessage({
    receiver_id,
    message: message || '📷 Image',
    attachment_url: uploadData.url,
    attachment_type: image.type,
    message_type: 'image'
  })
}

/**
 * Subscribe to real-time private messages for a user using centralized manager
 * 
 * This function subscribes to new private messages where the current user
 * is the receiver. Uses centralized realtimeManager for duplicate prevention
 * and automatic retry logic.
 * 
 * @param {string} userId - User UUID
 * @param {Function} onMessage - Callback function for new messages
 * @returns {Promise<Object>} Subscription object with unsubscribe method
 * 
 * Usage Example:
 * ```javascript
 * const subscription = await subscribeToPrivateMessages(
 *   currentUserId,
 *   (newMessage) => {
 *     console.log('New private message:', newMessage)
 *     // Update UI with new message
 *     setMessages(prev => [...prev, newMessage])
 *   }
 * )
 * 
 * // Cleanup on unmount
 * useEffect(() => {
 *   return () => {
 *     if (subscription) {
 *       subscription.unsubscribe()
 *     }
 *   }
 * }, [currentUserId])
 * ```
 */
export async function subscribeToPrivateMessages(userId, onMessage) {
  const channelName = realtimeManager.getStandardChannelName('privateMessages', userId)

  console.log('[REALTIME] 🔌 Subscribing to private_messages channel:', channelName)

  const setupPrivateMessagesChannel = (channel) => {
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'private_messages',
        filter: `receiver_id=eq.${userId}`
      },
      (payload) => onMessage(payload.new)
    )
  }

  try {
    await realtimeManager.subscribeStandard(
      'privateMessages',
      setupPrivateMessagesChannel,
      [userId],
      userId
    )

    return {
      unsubscribe: () => {
        console.log('[REALTIME] 🔌 Unsubscribing from private_messages channel:', channelName)
        realtimeManager.unsubscribe(channelName, [userId])
      }
    }
  } catch (error) {
    console.error('[PRIVATE-MESSAGES-SERVICE] ❌ Failed to subscribe to private messages:', error)
    throw error
  }
}
