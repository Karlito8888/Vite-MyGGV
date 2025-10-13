import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * Location Association Requests Service
 * 
 * RLS Policies:
 * - SELECT: Approvers can view requests where they are the approver
 * - INSERT: Authenticated users can create requests (requester_id must match auth.uid())
 * - UPDATE: Approvers can update requests where they are the approver
 * - DELETE: Not implemented
 */

/**
 * List pending requests for the current user (as approver)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listMyPendingRequests() {
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
}

/**
 * List all requests for a specific location
 * @param {string} locationId - Location UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listLocationRequests(locationId) {
  return executeQuery(
    supabase
      .from('location_association_requests')
      .select(`
        *,
        requester:profiles!location_association_requests_requester_id_fkey(*),
        approver:profiles!location_association_requests_approver_id_fkey(*)
      `)
      .eq('location_id', locationId)
      .order('created_at', { ascending: false })
  )
}

/**
 * Get a specific request by ID
 * @param {number} id - Request ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getLocationAssociationRequest(id) {
  return executeQuery(
    supabase
      .from('location_association_requests')
      .select(`
        *,
        requester:profiles!location_association_requests_requester_id_fkey(*),
        approver:profiles!location_association_requests_approver_id_fkey(*),
        location:locations(*)
      `)
      .eq('id', id)
      .single()
  )
}

/**
 * Create a location association request
 * RLS ensures requester_id matches auth.uid() and approver is verified owner
 * @param {Object} requestData - Request data
 * @param {string} requestData.location_id - Location UUID
 * @param {string} requestData.approver_id - Approver profile UUID (must be verified owner)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createLocationAssociationRequest(requestData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('location_association_requests')
      .insert({
        ...requestData,
        requester_id: userId,
        status: 'pending'
      })
      .select()
      .single()
  )
}

/**
 * Approve a location association request
 * RLS ensures only the approver can update
 * @param {number} id - Request ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function approveLocationAssociationRequest(id) {
  return executeQuery(
    supabase
      .from('location_association_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  )
}

/**
 * Reject a location association request
 * RLS ensures only the approver can update
 * @param {number} id - Request ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function rejectLocationAssociationRequest(id) {
  return executeQuery(
    supabase
      .from('location_association_requests')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  )
}
