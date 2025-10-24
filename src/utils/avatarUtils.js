import { supabase } from './supabase'

/**
 * Utility functions for handling avatar URLs with Supabase Storage
 */

/**
 * Get the public URL for an avatar from Supabase Storage
 * @param {string} avatarPath - Path or filename in the avatars bucket
 * @returns {string|null} Public URL or null if no path provided
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null

  // If it's already a full URL, return it
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath
  }

  // Get public URL from Supabase Storage
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(avatarPath)

  return data.publicUrl
}

/**
 * Get a transformed (resized) avatar URL
 * @param {string} avatarPath - Path or filename in the avatars bucket
 * @param {Object} options - Transformation options
 * @param {number} options.width - Width in pixels
 * @param {number} options.height - Height in pixels
 * @param {number} options.quality - Quality (20-100)
 * @returns {string|null} Transformed URL or null
 */
export const getTransformedAvatarUrl = (avatarPath, options = {}) => {
  if (!avatarPath) return null

  // If it's already a full URL, return it as-is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath
  }

  const { width = 200, height = 200, quality = 80 } = options

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(avatarPath, {
      transform: {
        width,
        height,
        resize: 'cover',
        quality
      }
    })

  return data.publicUrl
}

/**
 * Extract filename from avatar URL
 * @param {string} avatarUrl - Full avatar URL
 * @returns {string|null} Filename or null
 */
export const getAvatarFilename = (avatarUrl) => {
  if (!avatarUrl) return null

  try {
    const url = new URL(avatarUrl)
    const pathParts = url.pathname.split('/')
    return pathParts[pathParts.length - 1]
  } catch {
    // If it's not a URL, assume it's already a filename
    return avatarUrl
  }
}

/**
 * Check if avatar URL is valid and accessible
 * @param {string} avatarUrl - Avatar URL to check
 * @returns {Promise<boolean>} True if accessible
 */
export const isAvatarAccessible = async (avatarUrl) => {
  if (!avatarUrl) return false

  try {
    const response = await fetch(avatarUrl, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}
