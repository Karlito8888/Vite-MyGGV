import { useState, useEffect } from 'react'
import '../styles/ThemeToggle.css'

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    // Get initial theme from localStorage or default to light
    return localStorage.getItem('theme') || 'light'
  })
  
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 60)
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Initial check
    handleScroll()

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    
    // Update state
    setTheme(newTheme)
    
    // Update document class
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'light' ? '#ffffff' : '#1a1a1a')
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme)
  }

  return (
    <button
      className={`theme-toggle df ${isScrolled ? 'scrolled' : ''}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        // Moon icon for dark mode
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  )
}

export default ThemeToggle
