import { useEffect, useRef, useCallback, useState } from 'react'
import { usePageVisibility } from './usePageVisibility'

/**
 * Hook pour gérer une connexion Realtime Supabase avec reconnexion automatique
 * 
 * Ce hook gère :
 * - La création et le nettoyage de la souscription
 * - La reconnexion automatique lors du retour sur l'onglet
 * - La détection et récupération des connexions gelées
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
 * @param {boolean} options.enableHealthCheck - Activer la vérification de santé (défaut: true)
 * 
 * @returns {Object} { isConnected, reconnect, disconnect, connectionState }
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
    onDisconnect = null,
    enableHealthCheck = true
  } = options

  const isVisible = usePageVisibility()
  const subscriptionRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const wasVisibleRef = useRef(isVisible)
  const lastActivityRef = useRef(Date.now())
  const [connectionState, setConnectionState] = useState('disconnected') // 'disconnected', 'connecting', 'connected', 'frozen'
  
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
      setConnectionState('disconnected')
      setIsConnected(false)
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
    setConnectionState('connecting')
    setIsConnected(false)
    try {
      const subscription = subscribeFunctionRef.current()
      subscriptionRef.current = subscription
      setIsConnected(true)
      lastActivityRef.current = Date.now()
      setConnectionState('connected')

      if (onReconnectRef.current) {
        onReconnectRef.current()
      }
    } catch (error) {
      console.error('[REALTIME] ❌ Error creating subscription:', error)
      setIsConnected(false)
      setConnectionState('frozen')
    }
  }, [])

  /**
   * Vérifie si la connexion est gelée en testant l'activité récente
   * Une connexion est considérée gelée si aucune activité n'a été détectée
   * depuis plus de 30 secondes et que l'onglet vient de redevenir visible
   */
  const checkConnectionHealth = useCallback(() => {
    if (!enableHealthCheck || !subscriptionRef.current) {
      return true
    }

    const timeSinceLastActivity = Date.now() - lastActivityRef.current
    const isLikelyFrozen = timeSinceLastActivity > 30000 // 30 secondes

    if (isLikelyFrozen) {
      console.log('[REALTIME] ⚠️ Connection appears frozen (no activity for', timeSinceLastActivity, 'ms)')
      setConnectionState('frozen')
      return false
    }

    return true
  }, [enableHealthCheck])

  // Connexion initiale et lors des changements de dépendances
  useEffect(() => {
    connect()
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  // Reconnexion lors du retour sur l'onglet avec vérification de santé
  useEffect(() => {
    if (!reconnectOnVisibility) return

    // Détecter le passage de caché à visible
    const becameVisible = !wasVisibleRef.current && isVisible
    const wasHidden = wasVisibleRef.current === false
    wasVisibleRef.current = isVisible

    if (becameVisible && isConnected && wasHidden) {
      console.log('[REALTIME] 👁️ Page became visible, checking connection health...')
      
      // Calculer le temps passé caché
      const timeSinceLastActivity = Date.now() - lastActivityRef.current
      const wasHiddenLongTime = timeSinceLastActivity > 30000 // Plus de 30 secondes
      
      // TOUJOURS reconnecter si l'onglet était caché longtemps
      // Les connexions WebSocket sont souvent gelées par le navigateur après 30s
      if (wasHiddenLongTime) {
        console.log('[REALTIME] 🏥 Tab was hidden for', Math.round(timeSinceLastActivity / 1000), 'seconds, forcing reconnection')
        
        // Ajouter un délai aléatoire (0-200ms) pour étaler les reconnexions
        const staggerDelay = Math.random() * 200
        const totalDelay = reconnectDelay + staggerDelay
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[REALTIME] 🔄 Reconnecting after long inactivity')
          // Nettoyer d'abord la connexion existante avant de reconnecter
          cleanup()
          connect()
        }, totalDelay)
      } else {
        console.log('[REALTIME] ✅ Short absence (', Math.round(timeSinceLastActivity / 1000), 's), keeping connection')
        // Mettre à jour l'activité pour indiquer que la connexion est vérifiée
        lastActivityRef.current = Date.now()
      }
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible])

  // Mettre à jour l'activité périodiquement pour détecter les connexions actives
  useEffect(() => {
    if (!isConnected || !isVisible) return

    const activityInterval = setInterval(() => {
      // Mettre à jour l'activité si la connexion est toujours active
      if (subscriptionRef.current) {
        lastActivityRef.current = Date.now()
      }
    }, 10000) // Vérifier toutes les 10 secondes

    return () => clearInterval(activityInterval)
  }, [isVisible, isConnected])

  return {
    isConnected,
    reconnect: connect,
    disconnect: cleanup,
    connectionState,
    checkHealth: checkConnectionHealth
  }
}
