import { useState } from 'react'
import { useGlobalPresence } from '../contexts/GlobalPresenceContext'
import { useUser } from '../contexts'
import styles from './Avatar.module.css'

/**
 * Avatar component for displaying user profile images with fallback support
 * Simplified version - display only, no upload functionality
 * For upload functionality, use AvatarUploader component instead
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - URL to avatar image
 * @param {string} props.userId - User ID to check presence for (optional, defaults to current user)
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} props.size - Size variant: 'small', 'medium', 'large'
 * @param {string} props.fallback - Fallback text/initial when no image
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showPresence - Show online presence indicator
 */
function Avatar({
  src,
  userId,
  alt = 'User avatar',
  size = 'medium',
  fallback = 'U',
  className = '',
  showPresence = true
}) {
  const { user } = useUser()
  const { isUserOnline } = useGlobalPresence()
  
  // Use provided userId or fallback to current user
  const targetUserId = userId || user?.id
  const isOnline = targetUserId ? isUserOnline(targetUserId) : false
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const showFallback = !src || imageError
  const fallbackText = (fallback && /[a-zA-Z]/.test(fallback[0])) ? fallback[0].toUpperCase() : 'U'

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const avatarClasses = [
    styles.avatar,
    styles[size],
    showFallback ? styles.fallbackStyle : '',
    !imageLoaded && src ? styles.loading : '',
    showPresence && isOnline ? styles.online : '',
    className.includes('header-avatar-component') ? styles.headerAvatar : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={avatarClasses}>
      {showFallback ? (
        <div className={styles.fallback}>
          <span className={styles.fallbackText}>{fallbackText}</span>
        </div>
      ) : (
        <>
          <img
            key={src}
            src={src}
            alt={alt}
            className={`${styles.image} ${!imageLoaded ? styles.imageLoading : ''}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {!imageLoaded && src && (
            <div className={styles.loadingPlaceholder}>
              <span className={styles.fallbackText}>{fallbackText}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Avatar