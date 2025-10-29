import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router'
import {
  XMarkIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  CloudIcon,
  ShoppingBagIcon,
  MapPinIcon,
  UserIcon,
  BellIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../utils/supabase'
import { useUser } from '../contexts'
import styles from './Sidebar.module.css'

// Navigation links configuration
const NAV_LINKS = [
  { to: '/home', icon: HomeIcon, label: 'Home' },
  { to: '/messages', icon: ChatBubbleLeftRightIcon, label: 'Messages' },
  { to: '/games', icon: PuzzlePieceIcon, label: 'Games' },
  { to: '/infos', icon: InformationCircleIcon, label: 'Infos' },
  { to: '/money', icon: CurrencyDollarIcon, label: 'Money' },
  { to: '/weather', icon: CloudIcon, label: 'Weather' },
  { to: '/marketplace', icon: ShoppingBagIcon, label: 'Marketplace' },
  { to: '/location-requests', icon: BellIcon, label: 'Requests' },
  { to: '/profile', icon: UserIcon, label: 'Profile' }
]

// External link
const EXTERNAL_LINK = {
  href: 'https://myggv-gps.netlify.app/',
  icon: MapPinIcon,
  label: 'GPS'
}

function Sidebar({ isOpen, onClose }) {
  const { user } = useUser()
  const location = useLocation()
  const closeButtonRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)

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

    return () => timers.forEach(timer => clearTimeout(timer))
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
      document.body.style.overflow = 'hidden'
      setTimeout(() => closeButtonRef.current?.focus(), 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    onClose?.()
  }

  // Mouse event handlers for vertical drag scrolling
  const handleMouseDown = useCallback((e) => {
    if (!scrollContainerRef.current) return

    e.preventDefault()
    setIsDragging(true)
    setStartY(e.pageY)
    setScrollTop(scrollContainerRef.current.scrollTop)
    scrollContainerRef.current.style.cursor = 'grabbing'
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !scrollContainerRef.current) return

    e.preventDefault()
    const walk = (e.pageY - startY) * 2
    scrollContainerRef.current.scrollTop = scrollTop - walk
  }, [isDragging, startY, scrollTop])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  // Add global mouse event listeners for better drag handling
  useEffect(() => {
    if (!isDragging) return

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleDragEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleDragEnd)
    }
  }, [isDragging, handleMouseMove, handleDragEnd])

  if (!shouldRender) return null

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`${styles.sidebarOverlay} ${isVisible ? styles.open : ''}`}
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
        className={`${styles.sidebar} ${isVisible ? styles.open : ''}`}
        role="navigation"
        aria-label="Main navigation menu"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          className={styles.sidebarCloseBtn}
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <XMarkIcon className={styles.sidebarCloseIcon} />
        </button>

        {/* Navigation content */}
        {user && (
          <nav className={styles.navigation}>
            <div
              className={`${styles.navScrollContainer} ${isDragging ? styles.dragging : ''}`}
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              <div className={styles.navScrollContent}>
                {/* Internal navigation links */}
                {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`${styles.navLink} ${location.pathname === to ? styles.active : ''}`}
                    onClick={onClose}
                  >
                    <Icon className={styles.navIcon} />
                    <span>{label}</span>
                  </Link>
                ))}

                {/* External GPS link */}
                <a
                  href={EXTERNAL_LINK.href}
                  className={`${styles.navLink} ${styles.externalLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                >
                  <EXTERNAL_LINK.icon className={styles.navIcon} />
                  <span>{EXTERNAL_LINK.label}</span>
                </a>

                {/* Logout button */}
                <button
                  className={styles.navLink}
                  onClick={handleLogout}
                >
                  <ArrowRightStartOnRectangleIcon className={styles.navIcon} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </>
  )
}

export default Sidebar
