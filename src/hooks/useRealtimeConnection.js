import { useEffect, useRef, useCallback } from 'react'
import { usePageVisibility } from '../contexts/PageVisibilityContext'

/**
 * Hook pour gérer une connexion Realtime Supabase avec reconnexion automatique
 * 
 * Ce hook gère :
 * - La création et le nettoyage de la souscription
 * - La reconnexion automatique lors du retour sur l'onglet
 * - Les callbacks de reconnexion/déconnexion
 * 
 * @param {Function} subscribeFunction - Fonction qui crée et retourne la souscription
 *                                       Doit retourner un objet avec une méthode unsubscribe()
 * @param {Array} dependencies - Dépendances pour recréer la souscription
 * @param {Object} options - Options de configuration
 * @param {boolean} options.reconnectOnVisibility - Reconnecter lors du retour sur l'onglet (défaut: true)
 * @param {number} options.reconnectDelay - Délai avant reconnexion en ms (défaut: 1000)
 * @param {Function} options.onReconnect - Callback appelé après reconnexion
 * @param {Function} options.onDisconnect - Callback appelé après déconnexion
 * 
 * @returns {Object} { isConnected, reconnect, disconnect }
 */
export function useRealtimeConnection(
  subscribeFunction,
  dependencies = [],
  options = {}
) {
  const {
    reconnectOnVisibility = true,
    reconnectDelay = 1000,
    onReconnect = null,
    onDisconnect = null
  } = options

  const isVisible = usePageVisibility()
  const subscriptionRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const isConnectedRef = useRef(false)
  const wasVisibleRef = useRef(isVisible)
  
  // Store callbacks in refs to avoid recreating connect/cleanup
  const subscribeFunctionRef = useRef(subscribeFunction)
  const onReconnectRef = useRef(onReconnect)
  const onDisconnectRef = useRef(onDisconnect)
  
  // Update refs when callbacks change
  useEffect(() => {
    subscribeFunctionRef.current = subscribeFunction
    onReconnectRef.current = onReconnect
    onDisconnectRef.current = onDisconnect
  }, [subscribeFunction, onReconnect, onDisconnect])

  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('[REALTIME] 🧹 Cleaning up subscription')
      try {
        if (typeof subscriptionRef.current.unsubscribe === 'function') {
          subscriptionRef.current.unsubscribe()
        } else if (typeof subscriptionRef.current === 'function') {
          subscriptionRef.current()
        }
      } catch (error) {
        console.error('[REALTIME] ❌ Error during cleanup:', error)
      }
      subscriptionRef.current = null
      isConnectedRef.current = false
      
      if (onDisconnectRef.current) {
        onDisconnectRef.current()
      }
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    // Prevent duplicate connections
    if (subscriptionRef.current) {
      console.log('[REALTIME] ⚠️ Already connected, skipping')
      return
    }

    console.log('[REALTIME] 🔌 Creating new subscription')
    try {
      const subscription = subscribeFunctionRef.current()
      subscriptionRef.current = subscription
      isConnectedRef.current = true

      if (onReconnectRef.current) {
        onReconnectRef.current()
      }
    } catch (error) {
      console.error('[REALTIME] ❌ Error creating subscription:', error)
      isConnectedRef.current = false
    }
  }, [])

  // Connexion initiale et lors des changements de dépendances
  useEffect(() => {
    connect()
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  // Reconnexion lors du retour sur l'onglet
  useEffect(() => {
    if (!reconnectOnVisibility) return

    // Détecter le passage de caché à visible
    const becameVisible = !wasVisibleRef.current && isVisible
    wasVisibleRef.current = isVisible

    if (becameVisible && isConnectedRef.current) {
      console.log('[REALTIME] 👁️ Page became visible, scheduling reconnection...')
      
      // Délai avant reconnexion pour éviter les reconnexions multiples
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('[REALTIME] 🔄 Reconnecting after visibility change')
        connect()
      }, reconnectDelay)
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible])

  return {
    isConnected: isConnectedRef.current,
    reconnect: connect,
    disconnect: cleanup
  }
}
