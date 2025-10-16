import { useState } from 'react'
import ImageCropper from './ImageCropper'
import { avatarService } from '../services/avatarService'
import '../styles/Avatar.css'

/**
 * Avatar component for displaying user profile images with fallback support
 * @param {Object} props - Component props
 * @param {string} props.src - URL to avatar image
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} props.size - Size variant: 'small', 'medium', 'large'
 * @param {string} props.fallback - Fallback text/initial when no image
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.isOnline - Whether the user is currently online
 * @param {boolean} props.uploadMode - Enable upload functionality
 * @param {Function} props.onUpload - Callback when avatar is uploaded
 * @param {boolean} props.defaultAvatar - Use default GGV avatar as fallback
 */
function Avatar({ 
  src, 
  alt = 'User avatar', 
  size = 'medium', 
  fallback = 'U', 
  className = '', 
  isOnline = false,
  uploadMode = false,
  onUpload,
  defaultAvatar = false
}) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)





  // Determine if we should show fallback
  const showFallback = !src || imageError

  // Get avatar source (use default avatar if enabled and no src)
  const getAvatarSrc = () => {
    if (src && !imageError) {
      return src
    }
    if (defaultAvatar && showFallback) {
      return avatarService.getDefaultAvatarUrl()
    }
    return null
  }

  // Generate fallback text (use first character if it's a letter, otherwise use provided fallback)
  const getFallbackText = () => {
    if (fallback && fallback.length > 0 && /[a-zA-Z]/.test(fallback[0])) {
      return fallback[0].toUpperCase()
    }
    return 'U'
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file
    const validation = avatarService.validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setSelectedFile(file)
    setShowCropper(true)
    
    // Reset file input
    event.target.value = ''
  }

  const handleCropConfirm = async (croppedImageData) => {
    setIsUploading(true)
    setShowCropper(false)

    try {
      if (onUpload) {
        // Convert base64 to blob for compatibility with existing upload logic
        const response = await fetch(croppedImageData)
        const blob = await response.blob()
        await onUpload(blob)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload avatar. Please try again.')
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setSelectedFile(null)
  }

  const avatarClasses = [
    'avatar',
    `avatar--${size}`,
    showFallback ? 'avatar--fallback' : '',
    !imageLoaded && getAvatarSrc() ? 'avatar--loading' : '',
    isOnline ? 'avatar--online' : '',
    uploadMode ? 'avatar--upload-mode' : '',
    className
  ].filter(Boolean).join(' ')





  const avatarSrc = getAvatarSrc()

  return (
    <>
      <div className={avatarClasses}>
        {showFallback && !avatarSrc ? (
          <div className="avatar__fallback">
            <span className="avatar__fallback-text">{getFallbackText()}</span>
          </div>
        ) : (
          <>
            <img
              src={avatarSrc}
              alt={alt}
              className={`avatar__image ${!imageLoaded ? 'avatar__image--loading' : ''}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {!imageLoaded && avatarSrc && (
              <div className="avatar__loading-placeholder">
                <span className="avatar__fallback-text">{getFallbackText()}</span>
              </div>
            )}
          </>
        )}
        
        {uploadMode && (
          <div className="avatar__upload-overlay">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="avatar__file-input"
              disabled={isUploading}
            />
            <div className="avatar__upload-button">
              {isUploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <span className="avatar__upload-icon">📷</span>
                  <span className="avatar__upload-text">Change</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showCropper && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCrop={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  )
}

export default Avatar