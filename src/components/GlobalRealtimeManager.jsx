import { useEffect } from 'react'
import { useGlobalRealtimeManager } from '../hooks/useGlobalRealtimeManager'
import { usePageVisibility } from '../hooks/usePageVisibility'

/**
 * Composant qui gère globalement les connexions Realtime Supabase
 * Doit être monté au niveau le plus haut de l'application
 */
export function GlobalRealtimeManager() {
  const { isConnected, forceReconnectAll } = useGlobalRealtimeManager()
  const isVisible = usePageVisibility()

  // Log de l'état des connexions pour le debug
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[GLOBAL-REALTIME] 📊 Connection status:', isConnected)
    }
  }, [isConnected])

  // Forcer la reconnexion lors du retour sur l'onglet après une longue inactivité
  useEffect(() => {
    if (isVisible) {
      // Vérifier si toutes les connexions sont actives
      const allConnected = Object.values(isConnected).every(status => status)
      
      if (!allConnected) {
        console.log('[GLOBAL-REALTIME] ⚠️ Some connections are down, forcing reconnection')
        // Petit délai pour laisser le temps au navigateur de se réveiller
        setTimeout(forceReconnectAll, 500)
      }
    }
  }, [isVisible, isConnected, forceReconnectAll])

  // Ce composant ne rend rien, il gère seulement les connexions
  return null
}