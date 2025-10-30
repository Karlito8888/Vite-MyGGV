import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  HomeIcon,
  PuzzlePieceIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  CloudIcon,
  ShoppingBagIcon,
  MapPinIcon,
  UserIcon,
  BellIcon,
  ArrowRightStartOnRectangleIcon,
  EnvelopeIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../utils/supabase'
import { useUser } from '../contexts'
import styles from './Sidebar.module.css'

// Navigation links configuration
const NAV_LINKS = [
  { to: '/home', icon: HomeIcon, label: 'Home' },
  { to: '/messages', icon: EnvelopeIcon, label: 'Messages' },
  { to: '/chat', icon: ChatBubbleOvalLeftEllipsisIcon, label: 'Chat' },
  { to: '/games', icon: PuzzlePieceIcon, label: 'Games' },
  { to: '/infos', icon: InformationCircleIcon, label: 'Infos' },
  { to: '/money', icon: CurrencyDollarIcon, label: 'Money' },
  { to: '/weather', icon: CloudIcon, label: 'Weather' },
  { to: '/marketplace', icon: ShoppingBagIcon, label: 'Marketplace' },
  { to: '/location-requests', icon: BellIcon, label: 'Requests' },
  { to: '/profile', icon: UserIcon, label: 'Profile' },
  { to: '/install-app', icon: ArrowDownTrayIcon, label: 'Install App' }
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
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)

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
      setTimeout(() => closeButtonRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className={styles.sidebarOverlay}
            onClick={onClose}
            aria-label="Close navigation menu"
            role="button"
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onClose()
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              willChange: 'opacity',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          />

          {/* Sidebar */}
          <motion.div
            className={styles.sidebar}
            role="navigation"
            aria-label="Main navigation menu"
            aria-modal="true"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar
