import { useState } from 'react'
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
 */
function Avatar({ src, alt = 'User avatar', size = 'medium', fallback = 'U', className = '', isOnline = false }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)





  // Determine if we should show fallback
  const showFallback = !src || imageError

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

  const avatarClasses = [
    'avatar',
    `avatar--${size}`,
    showFallback ? 'avatar--fallback' : '',
    !imageLoaded && src ? 'avatar--loading' : '',
    isOnline ? 'avatar--online' : '',
    className
  ].filter(Boolean).join(' ')





  return (
    <div className={avatarClasses}>
      {showFallback ? (
        <div className="avatar__fallback">
          <span className="avatar__fallback-text">{getFallbackText()}</span>
        </div>
      ) : (
        <>
          <img
            src={src}
            alt={alt}
            className={`avatar__image ${!imageLoaded ? 'avatar__image--loading' : ''}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {!imageLoaded && (
            <div className="avatar__loading-placeholder">
              <span className="avatar__fallback-text">{getFallbackText()}</span>
            </div>
          )}
        </>
      )}
      

    </div>
  )
}

export default Avatar