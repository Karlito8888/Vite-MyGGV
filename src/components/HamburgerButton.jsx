import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'
import '../styles/HamburgerButton.css'

function HamburgerButton({ onToggle, isOpen = false }) {
  const { user } = useAuth()
  const location = useLocation()
  const [theme, setTheme] = useState(() => {
    // Get initial theme from localStorage or default to dark
    return localStorage.getItem('theme') || 'light'
  })

  // List of protected routes
  const protectedRoutes = ['/home', '/profile', '/messages', '/games', '/infos', '/money', '/weather', '/marketplace', '/location-requests']
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.includes(location.pathname)

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      setTheme(currentTheme)
    }

    // Initial theme check
    handleThemeChange()

    // Listen for theme changes (when ThemeToggle updates)
    const observer = new MutationObserver(handleThemeChange)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <button
      className={`hamburger-btn ${isOpen ? "open" : ""} ${!user || !isProtectedRoute ? "disabled" : ""}`}
      onClick={user && isProtectedRoute ? onToggle : undefined}
      disabled={!user || !isProtectedRoute}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
    >
      {theme === 'light' ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
      ) : (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
      )}
    </button>
  );
}

export default HamburgerButton