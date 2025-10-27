import { useState, useCallback, useId } from 'react'
import { supabase } from '../../services/baseService'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Button from './Button'
import './ImageUploader.css'

/**
 * ImageUploader Component
 * Allows uploading up to 6 images to Supabase Storage
 * 
 * @param {Object} props
 * @param {Array<string>} props.images - URLs of existing images
 * @param {Function} props.onChange - Callback called when images change
 * @param {number} props.maxImages - Maximum number of images (default: 6)
 * @param {string} props.bucket - Supabase bucket name (e.g., 'service-photos', 'business-inside-photos', 'business-outside-photos')
 * @param {string} props.folder - Folder in the bucket (default: 'uploads')
 * @param {string} props.label - Optional label for the uploader
 */
export default function ImageUploader({
  images = [],
  onChange,
  maxImages = 6,
  bucket = 'service-photos',
  folder = 'uploads',
  label
}) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputId = useId()

  const handleFiles = useCallback(async (files) => {
    if (images.length >= maxImages) {
      alert(`You can upload a maximum of ${maxImages} photos`)
      return
    }

    const remainingSlots = maxImages - images.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    setUploading(true)
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `${folder}/${fileName}`

        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        return publicUrl
      })
      
      const newUrls = await Promise.all(uploadPromises)
      onChange([...images, ...newUrls])
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading images')
    } finally {
      setUploading(false)
    }
  }, [images, maxImages, onChange, bucket, folder])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleChange = useCallback((e) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  return (
    <div className="image-uploader">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`image-uploader-dropzone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        >
          <input
            id={inputId}
            name="photos"
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            disabled={uploading}
            className="image-uploader-input"
            autoComplete="off"
          />
          <Upload className="image-uploader-icon" />
          <p className="image-uploader-text">
            {uploading ? 'Uploading...' : 'Click or drag and drop your images'}
          </p>
          <p className="image-uploader-counter">
            {images.length} / {maxImages} photos
          </p>
        </div>
      )}

      {/* Image preview */}
      {images.length > 0 && (
        <div className="image-uploader-grid">
          {images.map((url, index) => (
            <div key={index} className="image-uploader-item">
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                className="image-uploader-preview"
              />
              <Button
                type="button"
                onClick={() => removeImage(index)}
                variant="danger"
                size="small"
                className="image-uploader-remove"
              >
                <X size={16} />
              </Button>
              <div className="image-uploader-label">
                Photo {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="image-uploader-empty">
          <ImageIcon className="image-uploader-empty-icon" />
          <p className="image-uploader-empty-text">No photos added</p>
        </div>
      )}
    </div>
  )
}
