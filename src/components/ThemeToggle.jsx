import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import styles from './ThemeToggle.module.css'

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    // Get initial theme from localStorage or default to dark
    return localStorage.getItem('theme') || 'dark'
  })

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
      className={`${styles.themeToggle} df`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={24} />
      ) : (
        <Sun size={24} />
      )}
    </button>
  )
}

export default ThemeToggle
