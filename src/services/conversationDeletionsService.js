import { supabase, executeQuery } from './baseService'

/**
 * Conversation Deletions Service
 * 
 * RLS Policies:
 * - SELECT: Users can view their own deletion records (auth.uid() = user_id)
 * - INSERT: Users can insert their own deletion records (auth.uid() = user_id)
 * - UPDATE: Users can update their own deletion records (auth.uid() = user_id)
 * - DELETE: Users can delete their own deletion records (auth.uid() = user_id)
 * - ALL: Admins can manage all deletion records
 */

/**
 * Get conversation deletions for current user
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getMyConversationDeletions() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  return executeQuery(
    supabase
      .from('conversation_deletions')
      .select(`
        *,
        participant:profiles!conversation_deletions_participant_id_fkey(*),
        last_message:private_messages(*)
      `)
      .eq('user_id', user.id)
      .order('deleted_at', { ascending: false })
  )
}

/**
 * Check if a conversation was deleted by user
 * @param {string} participantId - Other user's UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getConversationDeletion(participantId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  return executeQuery(
    supabase
      .from('conversation_deletions')
      .select('*')
      .eq('user_id', user.id)
      .eq('participant_id', participantId)
      .single()
  )
}

/**
 * Mark a conversation as deleted for the current user
 * This hides messages from this conversation in the UI
 * @param {string} participantId - Other user's UUID
 * @param {string} [lastMessageId] - Last message ID in conversation
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteConversation(participantId, lastMessageId = null) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  return executeQuery(
    supabase
      .from('conversation_deletions')
      .insert({
        user_id: user.id,
        participant_id: participantId,
        last_message_id: lastMessageId,
        deleted_at: new Date().toISOString()
      })
      .select()
      .single()
  )
}

/**
 * Restore a deleted conversation
 * @param {string} participantId - Other user's UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function restoreConversation(participantId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  return executeQuery(
    supabase
      .from('conversation_deletions')
      .delete()
      .eq('user_id', user.id)
      .eq('participant_id', participantId)
  )
}

/**
 * Update last message ID for a deletion record
 * @param {number} id - Deletion record ID
 * @param {string} lastMessageId - Last message UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateConversationDeletion(id, lastMessageId) {
  return executeQuery(
    supabase
      .from('conversation_deletions')
      .update({ last_message_id: lastMessageId })
      .eq('id', id)
      .select()
      .single()
  )
}
