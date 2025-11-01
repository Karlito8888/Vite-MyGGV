import { useEffect, useRef } from 'react'
import { useGlobalRealtimeManager } from '../hooks/useGlobalRealtimeManager'

/**
 * Composant qui gère globalement les connexions Realtime Supabase
 * Doit être monté au niveau le plus haut de l'application
 */
export function GlobalRealtimeManager() {
  const { isConnected } = useGlobalRealtimeManager()
  const hasLoggedInitialStatus = useRef(false)

  // Log de l'état des connexions pour le debug (une seule fois au démarrage)
  useEffect(() => {
    if (import.meta.env.DEV && !hasLoggedInitialStatus.current) {
      const allConnected = Object.values(isConnected).every(status => status)
      if (allConnected && Object.keys(isConnected).length > 0) {
        console.log('[GLOBAL-REALTIME] 📊 Initial connection status:', isConnected)
        hasLoggedInitialStatus.current = true
      }
    }
  }, [isConnected])

  // Ce composant ne rend rien, il gère seulement les connexions
  // La reconnexion est gérée automatiquement par useRealtimeConnection et usePWATabRecovery
  return null
}