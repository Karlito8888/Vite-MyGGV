import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { XMarkIcon } from '@heroicons/react/24/solid'
import styles from './ImageModal.module.css'

function ImageModal({ imageUrl, onClose }) {
  // Block body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!imageUrl) return null

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeButton} 
          onClick={onClose} 
          aria-label="Close"
        >
          <XMarkIcon className={styles.closeIcon} />
        </button>
        <img 
          src={imageUrl} 
          alt="Full size" 
          className={styles.image}
        />
      </div>
    </div>,
    document.body
  )
}

export default ImageModal
