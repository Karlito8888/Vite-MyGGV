import { useState, useEffect } from 'react'
import { PageVisibilityContext } from './PageVisibilityContextValue'

/**
 * Provider pour partager l'état de visibilité de la page
 * Simple et léger - ne fait que tracker la visibilité
 *
 * Note: Les connexions Realtime sont gérées automatiquement par Supabase,
 * y compris la reconnexion après les changements de visibilité.
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

    // Écouter également l'événement focus pour une détection plus fiable
    const handleFocus = () => {
      if (document.hidden) return // Ignorer si le document est toujours caché

      if (import.meta.env.DEV) {
        console.log('[VISIBILITY] 🎯 Window focused')
      }

      setIsVisible(true)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return (
    <PageVisibilityContext.Provider value={isVisible}>
      {children}
    </PageVisibilityContext.Provider>
  )
}
