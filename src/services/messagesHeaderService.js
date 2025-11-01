import { supabase, executeQuery } from './baseService'
import { realtimeManager } from './realtimeManager'

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
 * Create a header message with coin payment
 * @param {Object} messageData - Message data
 * @param {string} messageData.message - Message content
 * @param {number} messageData.duration_hours - Duration in hours (12, 24, or 168)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createHeaderMessage(messageData) {
  const { message, duration_hours } = messageData

  const { data, error } = await supabase.rpc('publish_header_message_with_payment', {
    p_message: message,
    p_duration_hours: duration_hours
  })

  if (error) {
    return { data: null, error }
  }

  // Check if the function returned an error
  if (data && !data.success) {
    return { 
      data: null, 
      error: new Error(data.error || 'Failed to publish message')
    }
  }

  return { data, error: null }
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

/**
 * Subscribe to real-time updates for header messages using centralized manager
 * 
 * This function subscribes to all changes on the messages_header table and
 * triggers a refresh callback when any message is inserted, updated, or deleted.
 * Uses centralized realtimeManager for duplicate prevention and retry logic.
 * 
 * @param {Function} onMessageChange - Callback function when messages change
 * @param {Function} onStatusChange - Callback function for subscription status
 * @returns {Promise<Object>} Subscription object with cleanup function
 * 
 * Usage Example:
 * ```javascript
 * const subscription = await subscribeToHeaderMessages(
 *   () => {
 *     console.log('Header messages changed, refreshing...')
 *     // Refetch messages and update UI
 *     fetchMessages()
 *   },
 *   (status) => {
 *     console.log('Subscription status:', status)
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
 * }, [])
 * ```
 */
export async function subscribeToHeaderMessages(onMessageChange, onStatusChange) {
  console.log('[REALTIME] 🔌 Subscribing to header-messages channel')

  const setupHeaderMessagesChannel = (channel) => {
    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages_header",
        },
        (_payload) => {
          // Trigger message refresh on any change
          if (onMessageChange) {
            onMessageChange();
          }
        }
      )
  }

  try {
    const channel = await realtimeManager.subscribeStandard(
      'headerMessages',
      setupHeaderMessagesChannel,
      []
    )

    // Note: Status callback is handled by the manager, but we keep it for compatibility
    if (onStatusChange) {
      onStatusChange('SUBSCRIBED')
    }

    return {
      channel,
      unsubscribe: () => {
        console.log('[REALTIME] 🔌 Unsubscribing from header-messages channel')
        realtimeManager.unsubscribe('headerMessages', [])
      }
    }
  } catch (error) {
    console.error('[MESSAGES-HEADER-SERVICE] ❌ Failed to subscribe to header messages:', error)
    if (onStatusChange) {
      onStatusChange('CHANNEL_ERROR')
    }
    throw error
  }
}

/**
 * Unsubscribe from header messages real-time updates
 * @param {Object} subscription - Subscription object returned by subscribeToHeaderMessages
 */
export function unsubscribeFromHeaderMessages(subscription) {
  if (subscription && subscription.unsubscribe) {
    subscription.unsubscribe();
  }
}
