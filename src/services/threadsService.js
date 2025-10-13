import { supabase, executeQuery } from './baseService'

/**
 * Threads Service
 * 
 * RLS Policies:
 * - SELECT: Public access (anyone can view)
 * - INSERT: Authenticated users can create threads (auth.uid() = created_by)
 * - UPDATE: Not implemented
 * - DELETE: Not implemented
 */

/**
 * List all threads in a forum
 * @param {string} forumId - Forum UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listThreads(forumId) {
  return executeQuery(
    supabase
      .from('threads')
      .select(`
        *,
        creator:profiles!threads_created_by_fkey(*),
        forum:forums(*)
      `)
      .eq('forum_id', forumId)
      .order('created_at', { ascending: false })
  )
}

/**
 * List recent threads across all forums
 * @param {number} [limit=20] - Number of threads to retrieve
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listRecentThreads(limit = 20) {
  return executeQuery(
    supabase
      .from('threads')
      .select(`
        *,
        creator:profiles!threads_created_by_fkey(*),
        forum:forums(*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
  )
}

/**
 * Get a thread by ID
 * @param {string} id - Thread UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getThreadById(id) {
  return executeQuery(
    supabase
      .from('threads')
      .select(`
        *,
        creator:profiles!threads_created_by_fkey(*),
        forum:forums(*)
      `)
      .eq('id', id)
      .single()
  )
}

/**
 * Get threads created by a specific user
 * @param {string} userId - User UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getUserThreads(userId) {
  return executeQuery(
    supabase
      .from('threads')
      .select(`
        *,
        forum:forums(*)
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
  )
}

/**
 * Create a new thread
 * RLS ensures created_by matches auth.uid()
 * @param {Object} threadData - Thread data
 * @param {string} threadData.forum_id - Forum UUID
 * @param {string} threadData.title - Thread title
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createThread(threadData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  return executeQuery(
    supabase
      .from('threads')
      .insert({
        ...threadData,
        created_by: user.id
      })
      .select()
      .single()
  )
}

/**
 * Search threads by title
 * @param {string} searchTerm - Search term
 * @param {string} [forumId] - Optional forum ID to filter by
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function searchThreads(searchTerm, forumId = null) {
  let query = supabase
    .from('threads')
    .select(`
      *,
      creator:profiles!threads_created_by_fkey(*),
      forum:forums(*)
    `)
    .ilike('title', `%${searchTerm}%`)

  if (forumId) {
    query = query.eq('forum_id', forumId)
  }

  return executeQuery(
    query.order('created_at', { ascending: false })
  )
}
