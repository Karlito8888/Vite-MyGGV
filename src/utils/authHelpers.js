import { supabase } from './supabase'

/**
 * Extract user information from JWT claims
 * @param {Object} claims - JWT claims from getClaims()
 * @returns {Object|null} User object or null if invalid claims
 */
export function extractUserFromClaims(claims) {
  console.log('AuthHelpers: extractUserFromClaims() called with:', claims)
  
  if (!claims || !claims.sub) {
    console.log('AuthHelpers: Invalid claims - missing claims or sub:', { hasClaims: !!claims, hasSub: !!claims?.sub })
    return null
  }

  const user = {
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
  
  console.log('AuthHelpers: Extracted user object:', user)
  return user
}

/**
 * Get current user with claims-based verification
 * Uses getClaims() for better security and performance
 * @returns {Promise<{user: Object|null, error: Error|null, method: string}>}
 */
export async function getCurrentUserWithClaims() {
  console.log('AuthHelpers: getCurrentUserWithClaims() called')
  try {
    const { data, error } = await supabase.auth.getClaims()
    console.log('AuthHelpers: getClaims() result:', { data, error })
    
    if (error) {
      console.error('AuthHelpers: getClaims() failed:', error)
      return { user: null, error, method: 'getClaims' }
    }
    
    console.log('AuthHelpers: Claims data:', data?.claims)
    const user = extractUserFromClaims(data?.claims)
    console.log('AuthHelpers: Extracted user:', user)
    return { user, error: null, method: 'getClaims' }
  } catch (err) {
    console.error('AuthHelpers: Exception in getCurrentUserWithClaims():', err)
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
 * @returns {Promise<string|null>} User ID or null
 */
export async function getUserIdFromClaims() {
  try {
    const { data, error } = await supabase.auth.getClaims()
    
    if (error || !data?.claims?.sub) {
      return null
    }
    
    return data.claims.sub
  } catch {
    return null
  }
}

/**
 * Get authenticated user ID with error handling
 * @returns {Promise<{userId: string|null, error: Error|null}>}
 */
export async function getAuthenticatedUserId() {
  const userId = await getUserIdFromClaims()
  
  if (!userId) {
    return { 
      userId: null, 
      error: new Error('Not authenticated') 
    }
  }
  
  return { userId, error: null }
}

/**
 * Get user claims from JWT token
 * @returns {Promise<{data: {claims: object|null}, error: object|null}>}
 */
export async function getUserClaims() {
  try {
    const { data, error } = await supabase.auth.getClaims()
    return { data, error }
  } catch (error) {
    console.error('Error getting user claims:', error)
    return { data: { claims: null }, error }
  }
}

/**
 * Get full user object from server
 * Use when you need user metadata not available in claims
 * @returns {Promise<{data: {user: object|null}, error: object|null}>}
 */
export async function getUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  } catch (error) {
    console.error('Error getting user:', error)
    return { data: { user: null }, error }
  }
}

/**
 * Check if user is authenticated using claims
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const { data, error } = await getUserClaims()
  return !error && data.claims !== null
}

/**
 * Get user email from claims
 * @returns {Promise<string|null>}
 */
export async function getUserEmail() {
  const { data, error } = await getUserClaims()
  if (error || !data.claims) return null
  return data.claims.email || null
}

/**
 * Get user role from claims (if available)
 * @returns {Promise<string|null>}
 */
export async function getUserRole() {
  const { data, error } = await getUserClaims()
  if (error || !data.claims) return null
  return data.claims.role || data.claims['user_role'] || null
}

/**
 * Compatibility function to replace getSession()
 * Returns a session-like object for backward compatibility
 * @returns {Promise<{data: {session: object|null}, error: object|null}>}
 */
export async function getSessionCompat() {
  const { data: claimsData, error: claimsError } = await getUserClaims()
  
  if (claimsError || !claimsData.claims) {
    return { data: { session: null }, error: claimsError }
  }

  // Create session-like object from claims
  const session = {
    user: {
      id: claimsData.claims.sub,
      email: claimsData.claims.email,
      role: claimsData.claims.role || claimsData.claims['user_role'],
      // Add other common fields as needed
    },
    access_token: claimsData.claims.access_token,
    expires_at: claimsData.claims.exp,
    // Add other session fields as needed
  }

  return { data: { session }, error: null }
}

/**
 * Handle authentication errors consistently
 * @param {object} error - Error object from Supabase auth
 * @returns {object} Standardized error information
 */
export function handleAuthError(error) {
  if (!error) return { message: 'Unknown error', code: 'UNKNOWN' }

  return {
    message: error.message || 'Authentication error',
    code: error.code || 'AUTH_ERROR',
    status: error.status,
  }
}