import { useContext } from 'react'
import { PageVisibilityContext } from '../contexts/PageVisibilityContextValue'

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
