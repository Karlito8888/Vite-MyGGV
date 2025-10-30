import { createContext, useContext, useState, useEffect } from 'react'

const PageVisibilityContext = createContext(true)

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

/**
 * Hook pour accéder à l'état de visibilité de la page
 * @returns {boolean} true si la page est visible, false sinon
 */
export function usePageVisibility() {
  const context = useContext(PageVisibilityContext)
  if (context === undefined) {
    throw new Error('usePageVisibility must be used within a PageVisibilityProvider')
  }
  return context
}
