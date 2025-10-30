import { useState, useEffect } from 'react'
import { PageVisibilityContext } from './PageVisibilityContextValue'

/**
 * Provider pour partager l'état de visibilité de la page
 * Évite les multiples listeners et logs répétitifs
 */
export function PageVisibilityProvider({ children }) {
  const [isVisible, setIsVisible] = useState(!document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden
      // Un seul log pour toute l'app
      if (import.meta.env.DEV) {
        console.log('[VISIBILITY] 👁️ Page is now:', visible ? 'visible' : 'hidden')
      }
      setIsVisible(visible)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <PageVisibilityContext.Provider value={isVisible}>
      {children}
    </PageVisibilityContext.Provider>
  )
}

