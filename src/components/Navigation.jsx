import { Link, useLocation } from 'react-router'
import { useRef, useEffect, useCallback, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useUser } from '../contexts'
import { 
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
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import '../styles/Sidebar.css'

function Navigation({ onClose }) {
  const { user } = useUser()
  const location = useLocation()
  const scrollContainerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)



  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (onClose) {
      onClose()
    }
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
    const y = e.pageY
    const walk = (y - startY) * 2
    const newScrollTop = scrollTop - walk
    scrollContainerRef.current.scrollTop = newScrollTop
  }, [isDragging, startY, scrollTop])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  // Handle navigation link clicks
  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  // Add global mouse event listeners for better drag handling
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e) => {
      handleMouseMove(e)
    }
    
    const handleGlobalMouseUp = () => {
      handleMouseUp()
    }
    
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (!user) {
    return null
  }

  return (
    <nav className="navigation">
      <div 
        className={`nav-scroll-container ${isDragging ? 'dragging' : ''}`}
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="nav-scroll-content">
          <Link 
            to="/home" 
            className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <HomeIcon className="nav-icon" />
            <span>Home</span>
          </Link>
          <Link 
            to="/messages" 
            className={`nav-link ${location.pathname === '/messages' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <ChatBubbleLeftRightIcon className="nav-icon" />
            <span>Messages</span>
          </Link>
          <Link 
            to="/games" 
            className={`nav-link ${location.pathname === '/games' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <PuzzlePieceIcon className="nav-icon" />
            <span>Games</span>
          </Link>
          <Link 
            to="/infos" 
            className={`nav-link ${location.pathname === '/infos' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <InformationCircleIcon className="nav-icon" />
            <span>Infos</span>
          </Link>
          <Link 
            to="/money" 
            className={`nav-link ${location.pathname === '/money' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <CurrencyDollarIcon className="nav-icon" />
            <span>Money</span>
          </Link>
          <Link 
            to="/weather" 
            className={`nav-link ${location.pathname === '/weather' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <CloudIcon className="nav-icon" />
            <span>Weather</span>
          </Link>
          <Link 
            to="/marketplace" 
            className={`nav-link ${location.pathname === '/marketplace' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <ShoppingBagIcon className="nav-icon" />
            <span>Marketplace</span>
          </Link>
          <a 
            href="https://myggv-gps.netlify.app/" 
            className="nav-link external-link" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleLinkClick}
          >
            <MapPinIcon className="nav-icon" />
            <span>GPS</span>
          </a>
          <Link 
            to="/location-requests" 
            className={`nav-link ${location.pathname === '/location-requests' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <BellIcon className="nav-icon" />
            <span>Requests</span>
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <UserIcon className="nav-icon" />
            <span>Profile</span>
          </Link>
          <button 
            className="nav-link logout-link" 
            onClick={handleLogout}
          >
            <ArrowRightOnRectangleIcon className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation