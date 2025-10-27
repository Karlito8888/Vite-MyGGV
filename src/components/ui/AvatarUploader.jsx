import { useState, useRef, useEffect, useId } from 'react'
import { BeatLoader } from 'react-spinners'
import { Camera, Trash2, Upload } from 'lucide-react'
import ImageCropper from '../ImageCropper'
import { avatarService } from '../../services/avatarService'
import './AvatarUploader.css'

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
    small: 'avatar-uploader--small',
    medium: 'avatar-uploader--medium',
    large: 'avatar-uploader--large'
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

  const handleRemove = () => {
    if (confirm('Remove profile picture?')) {
      setPreviewUrl(null)
      if (onUploadSuccess) {
        onUploadSuccess('')
      }
    }
  }

  const fallbackText = (fallback && /[a-zA-Z]/.test(fallback[0]))
    ? fallback[0].toUpperCase()
    : 'U'

  return (
    <>
      <div className={`avatar-uploader ${sizeClasses[size]}`}>
        <div
          className={`avatar-uploader__container ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {/* Avatar Preview */}
          <div className="avatar-uploader__preview">
            {previewUrl && !imageError ? (
              <img
                src={previewUrl}
                alt="Avatar preview"
                className="avatar-uploader__image"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <div className="avatar-uploader__fallback">
                <span className="avatar-uploader__fallback-text">{fallbackText}</span>
              </div>
            )}
          </div>

          {/* Upload Overlay */}
          <div className="avatar-uploader__overlay">
            {isUploading ? (
              <div className="avatar-uploader__loading">
                <BeatLoader color="#ffffff" size={8} />
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="avatar-uploader__actions">
                <Camera className="avatar-uploader__icon" size={iconSizes[size]} />
                <span className="avatar-uploader__text">
                  {previewUrl ? 'Change' : 'Upload'}
                </span>
              </div>
            )}
          </div>

          {/* Drag & Drop Indicator */}
          {isDragging && (
            <div className="avatar-uploader__drag-indicator">
              <Upload className="avatar-uploader__drag-icon" size={48} />
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
          className="avatar-uploader__input"
          disabled={isUploading}
          autoComplete="off"
        />

        {/* Remove Button */}
        {previewUrl && !imageError && !isUploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleRemove()
            }}
            className="avatar-uploader__remove"
            title="Remove picture"
          >
            <Trash2 size={size === 'small' ? 14 : 18} />
          </button>
        )}
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
