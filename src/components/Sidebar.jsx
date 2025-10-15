import { useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Navigation from './Navigation'
import '../styles/Sidebar.css'

function Sidebar({ isOpen, onClose }) {
  const closeButtonRef = useRef(null)
  
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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="sidebar-overlay" 
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
        className="sidebar"
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
          <Navigation />
        </div>
      </div>
    </>
  )
}

export default Sidebar