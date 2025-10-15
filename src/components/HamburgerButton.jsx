import { useState, useEffect } from 'react'
import '../styles/HamburgerButton.css'

function HamburgerButton({ onToggle, isOpen = false }) {
  const [theme, setTheme] = useState(() => {
    // Get initial theme from localStorage or default to dark
    return localStorage.getItem('theme') || 'light'
  })

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
      className={`hamburger-btn ${isOpen ? "open" : ""}`}
      onClick={onToggle}
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