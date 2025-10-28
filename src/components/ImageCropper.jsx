import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import ReactCrop from 'react-image-crop'
import Button from './ui/Button'
import 'react-image-crop/dist/ReactCrop.css'

const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
  return {
    x: (mediaWidth - Math.min(mediaWidth, mediaHeight)) / 2,
    y: (mediaHeight - Math.min(mediaWidth, mediaHeight)) / 2,
    width: Math.min(mediaWidth, mediaHeight),
    height: Math.min(mediaWidth, mediaHeight),
    unit: 'px',
    aspect
  }
}

const getCroppedPngImage = async (imageSrc, scaleFactor, pixelCrop, maxImageSize) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Context is null, this should never happen.')
  }

  const scaleX = imageSrc.naturalWidth / imageSrc.width
  const scaleY = imageSrc.naturalHeight / imageSrc.height

  ctx.imageSmoothingEnabled = false
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    imageSrc,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  )

  const croppedImageUrl = canvas.toDataURL('image/png')
  const response = await fetch(croppedImageUrl)
  const blob = await response.blob()

  if (blob.size > maxImageSize) {
    return await getCroppedPngImage(imageSrc, scaleFactor * 0.9, pixelCrop, maxImageSize)
  }

  return croppedImageUrl
}

function ImageCropper({ imageFile, onCrop, onCancel }) {
  const imgRef = useRef(null)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState(null)

  useEffect(() => {
    const reader = new FileReader()
    reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget
    const newCrop = centerAspectCrop(width, height, 1)
    setCrop(newCrop)
  }, [])

  const applyCrop = async () => {
    if (!(imgRef.current && completedCrop)) return

    const croppedImage = await getCroppedPngImage(imgRef.current, 1, completedCrop, 1024 * 1024 * 5)
    onCrop(croppedImage)
  }

  if (!imgSrc) return null

  const modalContent = (
    <div className="modal-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="modal-content" style={{
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 0
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
            Crop Your Avatar
          </h3>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            size="small"
            style={{
              fontSize: '1.5rem',
              color: '#6b7280',
              padding: '0.25rem',
              width: '2rem',
              height: '2rem',
              minHeight: '2rem',
              borderRadius: '4px'
            }}
          >
            ×
          </Button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            style={{ '--rc-border-color': '#3b82f6', '--rc-focus-color': '#3b82f6' }}
          >
            <img
              ref={imgRef}
              alt="crop"
              src={imgSrc}
              onLoad={onImageLoad}
              style={{ maxWidth: '100%', display: 'block' }}
            />
          </ReactCrop>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem 1.5rem 1.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={applyCrop}
            disabled={!completedCrop}
            variant="primary"
            style={{ flex: 1 }}
          >
            Crop & Upload
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ImageCropper