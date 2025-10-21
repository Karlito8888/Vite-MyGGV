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
 * Get current user with secure JWT verification
 * Uses getUser() which validates the JWT against the server
 * Compatible with asymmetric JWT signing keys
 * @returns {Promise<{user: Object|null, error: Error|null, method: string}>}
 */
export async function getCurrentUserWithClaims() {
  console.log('AuthHelpers: getCurrentUserWithClaims() called')
  try {
    // getUser() validates the JWT and fetches fresh user data
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      // AuthSessionMissingError is expected when user is not logged in
      if (error.name === 'AuthSessionMissingError' || error.message?.includes('Auth session missing')) {
        console.log('AuthHelpers: No active session (user not logged in)')
        return { user: null, error: null, method: 'getUser' }
      }
      
      // Log other errors as they might be real issues
      console.error('AuthHelpers: getUser() failed:', error)
      return { user: null, error, method: 'getUser' }
    }

    // If no user, not authenticated
    if (!data?.user) {
      console.log('AuthHelpers: No user found')
      return { user: null, error: null, method: 'getUser' }
    }

    // Build user object from getUser response
    const user = {
      id: data.user.id,
      email: data.user.email || null,
      role: data.user.role || 'authenticated',
      aud: data.user.aud || 'authenticated',
      exp: null, // Not directly available from getUser
      iat: data.user.created_at || null,
      iss: null,
      session_id: null,
      is_anonymous: data.user.is_anonymous || false,
      app_metadata: data.user.app_metadata || {},
      user_metadata: data.user.user_metadata || {},
      phone: data.user.phone || null
    }

    console.log('AuthHelpers: User authenticated:', { id: user.id, email: user.email })
    return { user, error: null, method: 'getUser' }
  } catch (err) {
    console.error('AuthHelpers: Exception in getCurrentUserWithClaims():', err)
    return { user: null, error: err, method: 'getUser' }
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
 * Get user ID without full user object extraction
 * Useful for quick authentication checks
 * @returns {Promise<string|null>} User ID or null
 */
export async function getUserIdFromClaims() {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user?.id) {
      return null
    }

    return data.user.id
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
 * Get user data (replaces getUserClaims)
 * @returns {Promise<{data: {user: object|null}, error: object|null}>}
 */
export async function getUserClaims() {
  try {
    const { data, error } = await supabase.auth.getUser()
    return { 
      data: { claims: data?.user || null }, 
      error 
    }
  } catch (error) {
    console.error('Error getting user:', error)
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
 * Check if user is authenticated using getUser
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const { data, error } = await supabase.auth.getUser()
  return !error && data?.user !== null
}

/**
 * Get user email from user data
 * @returns {Promise<string|null>}
 */
export async function getUserEmail() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) return null
  return data.user.email || null
}

/**
 * Get user role from user data (if available)
 * @returns {Promise<string|null>}
 */
export async function getUserRole() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) return null
  return data.user.role || data.user.app_metadata?.role || null
}

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} options - Additional signup options
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function signUpUser(email, password, options = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        ...options
      }
    })

    if (error) {
      console.error('AuthHelpers: Sign up error:', error)
      return { data: null, error }
    }

    console.log('AuthHelpers: Sign up successful:', { userId: data?.user?.id, email })
    return { data, error: null }
  } catch (err) {
    console.error('AuthHelpers: Exception in signUpUser():', err)
    return { data: null, error: err }
  }
}

/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function signInUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('AuthHelpers: Sign in error:', error)
      return { data: null, error }
    }

    console.log('AuthHelpers: Sign in successful:', { userId: data?.user?.id, email })
    return { data, error: null }
  } catch (err) {
    console.error('AuthHelpers: Exception in signInUser():', err)
    return { data: null, error: err }
  }
}

/**
 * Reset password for email
 * @param {string} email - User email
 * @param {Object} options - Additional options
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function resetPasswordForEmail(email, options = {}) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
      ...options
    })

    if (error) {
      console.error('AuthHelpers: Reset password error:', error)
      return { data: null, error }
    }

    console.log('AuthHelpers: Reset password email sent successfully')
    return { data, error: null }
  } catch (err) {
    console.error('AuthHelpers: Exception in resetPasswordForEmail():', err)
    return { data: null, error: err }
  }
}

/**
 * Update user password
 * @param {string} password - New password
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateUserPassword(password) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      console.error('AuthHelpers: Update password error:', error)
      return { data: null, error }
    }

    console.log('AuthHelpers: Password updated successfully')
    return { data, error: null }
  } catch (err) {
    console.error('AuthHelpers: Exception in updateUserPassword():', err)
    return { data: null, error: err }
  }
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