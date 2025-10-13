import { supabase, executeQuery } from './baseService'
import { getAuthenticatedUserId } from '../utils/authHelpers'

/**
 * Forums Service
 * 
 * RLS Policies:
 * - SELECT: Public access (anyone can view)
 * - INSERT: Authenticated users can create forums
 * - UPDATE: Not implemented
 * - DELETE: Not implemented
 */

/**
 * List all forums
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listForums() {
  return executeQuery(
    supabase
      .from('forums')
      .select(`
        *,
        creator:profiles!forums_created_by_fkey(*)
      `)
      .order('created_at', { ascending: false })
  )
}

/**
 * Get a forum by ID
 * @param {string} id - Forum UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getForumById(id) {
  return executeQuery(
    supabase
      .from('forums')
      .select(`
        *,
        creator:profiles!forums_created_by_fkey(*)
      `)
      .eq('id', id)
      .single()
  )
}

/**
 * Get forum with thread count
 * @param {string} id - Forum UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getForumWithThreadCount(id) {
  const { data: forum, error: forumError } = await getForumById(id)
  if (forumError) return { data: null, error: forumError }

  const { count, error: countError } = await supabase
    .from('threads')
    .select('*', { count: 'exact', head: true })
    .eq('forum_id', id)

  if (countError) return { data: null, error: countError }

  return { data: { ...forum, thread_count: count }, error: null }
}

/**
 * Create a new forum
 * RLS ensures user is authenticated
 * @param {Object} forumData - Forum data
 * @param {string} forumData.title - Forum title
 * @param {string} [forumData.description] - Forum description
 * @param {string} [forumData.icon] - Icon identifier
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createForum(forumData) {
  const { userId, error } = await getAuthenticatedUserId()
  if (error) {
    return { data: null, error }
  }

  return executeQuery(
    supabase
      .from('forums')
      .insert({
        ...forumData,
        created_by: userId
      })
      .select()
      .single()
  )
}

/**
 * Search forums by title or description
 * @param {string} searchTerm - Search term
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function searchForums(searchTerm) {
  return executeQuery(
    supabase
      .from('forums')
      .select(`
        *,
        creator:profiles!forums_created_by_fkey(*)
      `)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
  )
}
