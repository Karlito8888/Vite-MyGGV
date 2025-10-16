import { supabase } from '../utils/supabase'

export const locationRequestsService = {
  // Get all pending requests for a location owner
  async getOwnerPendingRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('location_association_requests')
        .select(`
          id,
          status,
          created_at,
          locations:block, lot,
          requester:profiles!location_association_requests_requester_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('approver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get user's own location requests
  async getUserLocationRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('location_association_requests')
        .select(`
          id,
          status,
          created_at,
          approved_at,
          rejected_at,
          locations:block, lot,
          approver:profiles!location_association_requests_approver_id_fkey(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('requester_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('Error fetching user requests:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Respond to a location request (approve/deny)
  async respondToRequest(requestId, approve, responseMessage = null) {
    try {
      const { data, error } = await supabase
        .rpc('respond_to_location_request', {
          p_request_id: requestId,
          p_approve: approve,
          p_response_message: responseMessage
        })

      if (error) throw error

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('Error responding to request:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Check if user has any pending requests
  async hasPendingRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('location_association_requests')
        .select('id')
        .eq('requester_id', userId)
        .eq('status', 'pending')
        .limit(1)

      if (error) throw error

      return {
        success: true,
        hasPending: data.length > 0,
        count: data.length
      }
    } catch (error) {
      console.error('Error checking pending requests:', error)
      return {
        success: false,
        error: error.message,
        hasPending: false
      }
    }
  },

  // Get request statistics for an owner
  async getOwnerRequestStats(userId) {
    try {
      const { data, error } = await supabase
        .from('location_association_requests')
        .select('status')
        .eq('approver_id', userId)

      if (error) throw error

      const stats = {
        total: data.length,
        pending: data.filter(r => r.status === 'pending').length,
        approved: data.filter(r => r.status === 'approved').length,
        rejected: data.filter(r => r.status === 'rejected').length
      }

      return {
        success: true,
        data: stats
      }
    } catch (error) {
      console.error('Error fetching request stats:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}