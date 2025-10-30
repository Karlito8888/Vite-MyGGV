import { useState, useEffect } from 'react'

/**
 * Hook pour détecter la visibilité de la page
 * Utilise la Page Visibility API pour savoir quand l'utilisateur
 * change d'onglet ou revient sur l'application
 * 
 * @returns {boolean} true si la page est visible, false sinon
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden
      // Only log in development to reduce console noise
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

  return isVisible
}
