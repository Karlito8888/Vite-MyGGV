import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  CloudIcon,
  ShoppingBagIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useState, useRef, useEffect, useCallback } from 'react'
import '../styles/Navigation.css'

function Navigation() {
  const { user } = useAuth()
  const location = useLocation()
  const scrollContainerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Mouse event handlers for drag scrolling
  const handleMouseDown = useCallback((e) => {
    if (!scrollContainerRef.current) return
    
    e.preventDefault() // Add preventDefault here
    console.log('Mouse down - scrollLeft:', scrollContainerRef.current.scrollLeft)
    setIsDragging(true)
    setStartX(e.pageX)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    scrollContainerRef.current.style.cursor = 'grabbing'
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !scrollContainerRef.current) return
    
    e.preventDefault()
    const x = e.pageX
    const walk = (x - startX) * 2
    const newScrollLeft = scrollLeft - walk
    console.log('Mouse move - walk:', walk, 'newScrollLeft:', newScrollLeft)
    scrollContainerRef.current.scrollLeft = newScrollLeft
  }, [isDragging, startX, scrollLeft])

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

  // Add global mouse event listeners for better drag handling
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e) => {
      console.log('Global mouse move - isDragging:', isDragging)
      handleMouseMove(e)
    }
    
    const handleGlobalMouseUp = () => {
      console.log('Global mouse up')
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
          >
            <HomeIcon className="nav-icon" />
            <span>Home</span>
          </Link>
          <Link 
            to="/messages" 
            className={`nav-link ${location.pathname === '/messages' ? 'active' : ''}`}
          >
            <ChatBubbleLeftRightIcon className="nav-icon" />
            <span>Messages</span>
          </Link>
          <Link 
            to="/games" 
            className={`nav-link ${location.pathname === '/games' ? 'active' : ''}`}
          >
            <PuzzlePieceIcon className="nav-icon" />
            <span>Games</span>
          </Link>
          <Link 
            to="/infos" 
            className={`nav-link ${location.pathname === '/infos' ? 'active' : ''}`}
          >
            <InformationCircleIcon className="nav-icon" />
            <span>Infos</span>
          </Link>
          <Link 
            to="/money" 
            className={`nav-link ${location.pathname === '/money' ? 'active' : ''}`}
          >
            <CurrencyDollarIcon className="nav-icon" />
            <span>Money</span>
          </Link>
          <Link 
            to="/weather" 
            className={`nav-link ${location.pathname === '/weather' ? 'active' : ''}`}
          >
            <CloudIcon className="nav-icon" />
            <span>Weather</span>
          </Link>
          <Link 
            to="/marketplace" 
            className={`nav-link ${location.pathname === '/marketplace' ? 'active' : ''}`}
          >
            <ShoppingBagIcon className="nav-icon" />
            <span>Marketplace</span>
          </Link>
          <a 
            href="https://myggv-gps.netlify.app/" 
            className="nav-link external-link" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <MapPinIcon className="nav-icon" />
            <span>GPS</span>
          </a>
          <Link 
            to="/profile" 
            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            <UserIcon className="nav-icon" />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation