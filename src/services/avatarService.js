import { supabase } from '../utils/supabase'

/**
 * Service for handling avatar upload and storage operations
 */
class AvatarService {
  /**
   * Upload avatar image to Supabase storage
   * @param {string} userId - User ID
   * @param {Blob} imageBlob - Cropped image blob
   * @returns {Promise<Object>} Upload result with URL
   */
  async uploadAvatar(userId, imageBlob) {
    try {
      // Generate unique filename with folder structure
      const timestamp = Date.now()
      const filename = `${userId}/${timestamp}.jpg`
      
      // Upload to avatars bucket
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filename, imageBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Avatar upload error:', error)
        return { success: false, error: error.message }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filename)

      return { 
        success: true, 
        data: { 
          path: data.path,
          url: publicUrl,
          filename: filename
        }
      }
    } catch (error) {
      console.error('Avatar upload service error:', error)
      return { success: false, error: 'Failed to upload avatar' }
    }
  }

  /**
   * Delete old avatar from storage
   * @param {string} avatarUrl - URL of avatar to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteAvatar(avatarUrl) {
    try {
      if (!avatarUrl) {
        return { success: true }
      }

      // Extract filename from URL
      const urlParts = avatarUrl.split('/')
      const filename = urlParts[urlParts.length - 1]

      // Delete from avatars bucket
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filename])

      if (error) {
        console.error('Avatar deletion error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Avatar deletion service error:', error)
      return { success: false, error: 'Failed to delete avatar' }
    }
  }

  /**
   * Validate image file
   * @param {File} file - Image file to validate
   * @returns {Object} Validation result
   */
  validateImageFile(file) {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Please use JPG, PNG, or WebP images.' 
      }
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'File too large. Please choose an image smaller than 5MB.' 
      }
    }

    // Check file size (min 1KB)
    const minSize = 1 * 1024 // 1KB in bytes
    if (file.size < minSize) {
      return { 
        valid: false, 
        error: 'File too small. Please choose an image larger than 1KB.' 
      }
    }

    return { valid: true }
  }

  /**
   * Get default avatar URL
   * @returns {string} Default avatar URL
   */
  getDefaultAvatarUrl() {
    return '/src/assets/logos/ggv-100.png'
  }

  /**
   * Process image file for avatar upload
   * @param {File} file - Original image file
   * @returns {Promise<Object>} Processing result
   */
  async processImageFile(file) {
    try {
      // Validate file
      const validation = this.validateImageFile(file)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Create a promise to handle image processing
      return new Promise((resolve) => {
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        img.onload = () => {
      // Set canvas size to square (max 400px)
      const maxSize = 400
      const size = Math.min(img.width, img.height, maxSize)
      
      canvas.width = size
      canvas.height = size

          // Calculate crop coordinates (center crop)
          const x = (img.width - size) / 2
          const y = (img.height - size) / 2

          // Draw cropped image
          ctx.drawImage(img, x, y, size, size, 0, 0, size, size)

          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              resolve({ success: true, data: blob })
            } else {
              resolve({ success: false, error: 'Failed to process image' })
            }
          }, 'image/jpeg', 0.9)
        }

        img.onerror = () => {
          resolve({ success: false, error: 'Failed to load image' })
        }

        img.src = URL.createObjectURL(file)
      })
    } catch (error) {
      console.error('Image processing error:', error)
      return { success: false, error: 'Failed to process image' }
    }
  }
}

export const avatarService = new AvatarService()