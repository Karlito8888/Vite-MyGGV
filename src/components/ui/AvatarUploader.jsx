import { useState, useRef, useEffect, useId } from 'react'
import { BeatLoader } from 'react-spinners'
import { Camera, Upload } from 'lucide-react'
import ImageCropper from '../ImageCropper'
import { avatarService } from '../../services/avatarService'
import styles from './AvatarUploader.module.css'

/**
 * Modern Avatar Uploader Component with drag & drop, preview, and cropping
 * @param {Object} props - Component props
 * @param {string} props.currentAvatar - Current avatar URL
 * @param {string} props.userId - User ID for upload
 * @param {Function} props.onUploadSuccess - Callback when upload succeeds
 * @param {string} props.fallback - Fallback text/initial
 * @param {string} props.size - Size variant: 'small', 'medium', 'large'
 */
function AvatarUploader({
  currentAvatar,
  userId,
  onUploadSuccess,
  fallback = 'U',
  size = 'large'
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [showCropper, setShowCropper] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentAvatar)
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef(null)
  const inputId = useId()

  // Update preview when currentAvatar changes
  useEffect(() => {
    setPreviewUrl(currentAvatar)
    setImageError(false)
  }, [currentAvatar])

  const sizeClasses = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }

  const iconSizes = {
    small: 20,
    medium: 28,
    large: 32
  }

  const handleFileSelect = (file) => {
    if (!file) return

    // Validate file
    const validation = avatarService.validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setSelectedFile(file)
    setShowCropper(true)
  }

  const handleInputChange = (event) => {
    const file = event.target.files[0]
    handleFileSelect(file)
    // Reset input
    event.target.value = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    } else {
      alert('Please drop an image file')
    }
  }

  const handleCropConfirm = async (croppedImageData) => {
    setIsUploading(true)
    setShowCropper(false)

    try {
      // Convert base64 to blob
      const response = await fetch(croppedImageData)
      const blob = await response.blob()

      // Upload to Supabase
      const result = await avatarService.uploadAvatar(userId, blob)

      if (result.success) {
        setPreviewUrl(result.data.url)
        setImageError(false)
        if (onUploadSuccess) {
          onUploadSuccess(result.data.url)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload avatar. Please try again.')
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setSelectedFile(null)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }



  const fallbackText = (fallback && /[a-zA-Z]/.test(fallback[0]))
    ? fallback[0].toUpperCase()
    : 'U'

  return (
    <>
      <div className={`${styles.avatarUploader} ${sizeClasses[size]}`}>
        <div
          className={`${styles.container} ${isDragging ? styles.dragging : ''} ${isUploading ? styles.uploading : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {/* Avatar Preview */}
          <div className={styles.preview}>
            {previewUrl && !imageError ? (
              <img
                src={previewUrl}
                alt="Avatar preview"
                className={styles.image}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <div className={styles.fallback}>
                <span className={styles.fallbackText}>{fallbackText}</span>
              </div>
            )}
          </div>

          {/* Upload Overlay */}
          <div className={styles.overlay}>
            {isUploading ? (
              <div className={styles.loading}>
                <BeatLoader color="#ffffff" size={8} />
                <span>Uploading...</span>
              </div>
            ) : (
              <div className={styles.actions}>
                <Camera className={styles.icon} size={iconSizes[size]} />
                <span className={styles.text}>
                  {previewUrl ? 'Change' : 'Upload'}
                </span>
              </div>
            )}
          </div>

          {/* Drag & Drop Indicator */}
          {isDragging && (
            <div className={styles.dragIndicator}>
              <Upload className={styles.dragIcon} size={48} />
              <span>Drop image here</span>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          id={inputId}
          name="avatar"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className={styles.input}
          disabled={isUploading}
          autoComplete="off"
        />


      </div>

      {/* Image Cropper Modal */}
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

export default AvatarUploader
