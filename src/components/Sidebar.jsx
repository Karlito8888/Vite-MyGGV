import { useEffect, useRef, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Navigation from './Navigation'
import '../styles/Sidebar.css'

function Sidebar({ isOpen, onClose }) {
  const closeButtonRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  
  // Handle opening/closing animations
  useEffect(() => {
    const timers = []
    
    if (isOpen) {
      timers.push(
        setTimeout(() => setShouldRender(true), 0),
        setTimeout(() => setIsVisible(true), 10)
      )
    } else {
      timers.push(
        setTimeout(() => setIsVisible(false), 0),
        setTimeout(() => setShouldRender(false), 300)
      )
    }
    
    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [isOpen])
  
  // Handle Escape key press and focus management
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden'
      // Focus the close button for accessibility
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      // Restore body scroll when sidebar is closed
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!shouldRender) return null

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`sidebar-overlay ${isVisible ? 'open' : ''}`}
        onClick={onClose}
        aria-label="Close navigation menu"
        role="button"
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClose()
          }
        }}
      />
      
      {/* Sidebar */}
      <div 
        className={`sidebar ${isVisible ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation menu"
        aria-modal="true"
      >
        {/* Close button */}
        <button 
          ref={closeButtonRef}
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <XMarkIcon className="sidebar-close-icon" />
        </button>
        
        {/* Navigation component */}
        <div className="sidebar-navigation">
          <Navigation onClose={onClose} />
        </div>
      </div>
    </>
  )
}

export default Sidebar