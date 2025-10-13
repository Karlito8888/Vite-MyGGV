import { supabase } from './supabase'

/**
 * Extract user information from JWT claims
 * @param {Object} claims - JWT claims from getClaims()
 * @returns {Object|null} User object or null if invalid claims
 */
export function extractUserFromClaims(claims) {
  if (!claims || !claims.sub) {
    return null
  }

  return {
    id: claims.sub,
    email: claims.email || null,
    role: claims.role || 'anon',
    aud: claims.aud || 'authenticated',
    exp: claims.exp || null,
    iat: claims.iat || null,
    iss: claims.iss || null,
    session_id: claims.session_id || null,
    is_anonymous: claims.is_anonymous || false,
    app_metadata: claims.app_metadata || {},
    user_metadata: claims.user_metadata || {},
    phone: claims.phone || null
  }
}

/**
 * Get current user with claims-based verification
 * Uses getClaims() for better security and performance
 * @param {boolean} useFallback - Whether to use getUser() as fallback (default: true)
 * @returns {Promise<{user: Object|null, error: Error|null, method: string}>}
 */
export async function getCurrentUserWithClaims(useFallback = true) {
  try {
    const { data, error } = await supabase.auth.getClaims()
    
    if (error) {
      if (useFallback) {
        // eslint-disable-next-line no-console
        console.warn('getClaims() failed, falling back to getUser():', error.message)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        return { user, error: userError, method: 'getUser' }
      }
      return { user: null, error, method: 'getClaims' }
    }
    
    const user = extractUserFromClaims(data?.claims)
    return { user, error: null, method: 'getClaims' }
  } catch (err) {
    if (useFallback) {
      // eslint-disable-next-line no-console
      console.warn('getClaims() threw error, falling back to getUser():', err.message)
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        return { user, error: userError, method: 'getUser' }
      } catch {
        return { user: null, error: err, method: 'getUser' }
      }
    }
    return { user: null, error: err, method: 'getClaims' }
  }
}

/**
 * Verify if claims are valid and not expired
 * @param {Object} claims - JWT claims
 * @returns {boolean} True if claims are valid
 */
export function isValidClaims(claims) {
  if (!claims || !claims.exp || !claims.sub) {
    return false
  }
  
  // Check if token is expired (exp is in seconds)
  const now = Math.floor(Date.now() / 1000)
  return claims.exp > now
}

/**
 * Get user ID from claims without full user object extraction
 * Useful for quick authentication checks
 * @param {boolean} useFallback - Whether to use getUser() as fallback (default: true)
 * @returns {Promise<string|null>} User ID or null
 */
export async function getUserIdFromClaims(useFallback = true) {
  try {
    const { data, error } = await supabase.auth.getClaims()
    
    if (error || !data?.claims?.sub) {
      if (useFallback) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          return user?.id || null
        } catch {
          return null
        }
      }
      return null
    }
    
    return data.claims.sub
  } catch {
    if (useFallback) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        return user?.id || null
      } catch {
        return null
      }
    }
    return null
  }
}

/**
 * Get authenticated user ID with error handling
 * @returns {Promise<{userId: string|null, error: Error|null}>}
 */
export async function getAuthenticatedUserId() {
  const userId = await getUserIdFromClaims(true)
  
  if (!userId) {
    return { 
      userId: null, 
      error: new Error('Not authenticated') 
    }
  }
  
  return { userId, error: null }
}