import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'
import { realtimeManager } from './realtimeManager'

export const locationRequestsService = {
  /**
   * Get all pending location requests for the current owner
   * Uses RPC function for optimized query
   * @param {string} ownerId - The owner's user ID (optional, uses auth.uid() if not provided)
   * @returns {Promise<{success: boolean, data: Array, error?: string}>}
   */
  async getPendingRequests(ownerId = null) {
    try {
      let userId = ownerId
      
      if (!userId) {
        const { userId: authUserId, error: authError } = await getAuthenticatedUserId()
        if (authError) throw authError
        userId = authUserId
      }

      const { data, error } = await supabase
        .rpc('get_pending_location_requests', {
          p_owner_id: userId
        })

      if (error) throw error

      return {
        success: true,
        data: data || []
      }
    } catch (error) {

      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  /**
   * List pending requests using direct query (alternative to RPC)
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async listMyPendingRequests() {
    const { userId, error } = await getAuthenticatedUserId()
    if (error) {
      return { data: null, error }
    }

    return executeQuery(
      supabase
        .from('location_association_requests')
        .select(`
          *,
          requester:profiles!location_association_requests_requester_id_fkey(*),
          location:locations(*)
        `)
        .eq('approver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
    )
  },

  /**
   * Get all location requests (with optional status filter)
   * @param {string} ownerId - The owner's user ID
   * @param {string} status - Optional status filter ('pending', 'approved', 'rejected')
   * @returns {Promise<{success: boolean, data: Array, error?: string}>}
   */
  async getAllRequests(ownerId, status = null) {
    try {
      const { data, error } = await supabase
        .rpc('get_all_location_requests', {
          p_owner_id: ownerId,
          p_status: status
        })

      if (error) throw error

      return {
        success: true,
        data: data || []
      }
    } catch (error) {

      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  /**
   * Get all location requests made by the current user
   * @param {string} requesterId - The requester's user ID
   * @returns {Promise<{success: boolean, data: Array, error?: string}>}
   */
  async getMyRequests(requesterId) {
    try {
      const { data, error } = await supabase
        .rpc('get_my_location_requests', {
          p_requester_id: requesterId
        })

      if (error) throw error

      return {
        success: true,
        data: data || []
      }
    } catch (error) {

      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  /**
   * Approve a location request
   * @param {number} requestId - The request ID
   * @param {string} approverId - The approver's user ID
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async approveRequest(requestId, approverId) {
    try {
      const { data, error } = await supabase
        .rpc('handle_location_request_response', {
          p_request_id: requestId,
          p_approver_id: approverId,
          p_approve: true
        })

      if (error) throw error

      return {
        success: true,
        data: data
      }
    } catch (error) {

      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Reject a location request
   * @param {number} requestId - The request ID
   * @param {string} approverId - The approver's user ID
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async rejectRequest(requestId, approverId) {
    try {
      const { data, error } = await supabase
        .rpc('handle_location_request_response', {
          p_request_id: requestId,
          p_approver_id: approverId,
          p_approve: false
        })

      if (error) throw error

      return {
        success: true,
        data: data
      }
    } catch (error) {

      return {
        success: false,
        error: error.message
      }
    }
  },

   /**
    * Subscribe to real-time updates for location requests using centralized manager
    * 
    * This function subscribes to all changes on location_association_requests table
    * where the current user is the approver (owner). Uses centralized realtimeManager
    * for duplicate prevention and automatic retry logic.
    * 
    * @param {string} ownerId - The owner's user ID
    * @param {Function} callback - Callback function to handle changes
    * @returns {Promise<Object>} Subscription object with unsubscribe method
    * 
    * Usage Example:
    * ```javascript
    * const subscription = await locationRequestsService.subscribeToRequests(
    *   currentUserId,
    *   (payload) => {
    *     console.log('Location request changed:', payload)
    *     // Handle different event types
    *     if (payload.eventType === 'INSERT') {
    *       // New request received
    *       showNotification('New location request received')
    *     } else if (payload.eventType === 'UPDATE') {
    *       // Request status changed
    *       refreshRequestsList()
    *     }
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
  async subscribeToRequests(ownerId, callback) {
    const channelName = realtimeManager.getStandardChannelName('locationRequests')

    console.log('[REALTIME] 🔌 Subscribing to location_requests_changes channel for owner:', ownerId)

    const setupLocationRequestsChannel = (channel) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'location_association_requests',
          filter: `approver_id=eq.${ownerId}`
        },
        (payload) => {
          callback(payload)
        }
      )
    }

    try {
      await realtimeManager.subscribeStandard(
        'locationRequests',
        setupLocationRequestsChannel,
        [ownerId]
      )

      return {
        unsubscribe: () => {
          console.log('[REALTIME] 🔌 Unsubscribing from location_requests_changes channel for owner:', ownerId)
          realtimeManager.unsubscribe(channelName, [ownerId])
        }
      }
    } catch (error) {
      console.error('[LOCATION-REQUESTS-SERVICE] ❌ Failed to subscribe to location requests:', error)
      throw error
    }
   }
}
