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
    onDisconnect = null
  } = options

  const isVisible = usePageVisibility()
  const subscriptionRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const wasVisibleRef = useRef(false) // Start as false to detect first visibility change
  const lastHiddenTimeRef = useRef(null) // Timestamp quand la page devient cachée
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
   * Vérifie si la connexion est gelée
   * (Cette fonction n'est plus utilisée mais gardée pour compatibilité)
   */
  const checkConnectionHealth = useCallback(() => {
    return subscriptionRef.current !== null
  }, [])

  // Connexion initiale et lors des changements de dépendances
  useEffect(() => {
    connect()
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  // Gérer les changements de visibilité et la reconnexion
  useEffect(() => {
    // Détecter les transitions
    const becameHidden = !isVisible && wasVisibleRef.current
    const becameVisible = isVisible && !wasVisibleRef.current
    
    console.log('[REALTIME] 🔍 Visibility check - isVisible:', isVisible, 'wasVisibleRef:', wasVisibleRef.current, 'becameHidden:', becameHidden, 'becameVisible:', becameVisible)
    
    // Page vient de devenir cachée
    if (becameHidden) {
      lastHiddenTimeRef.current = Date.now()
      console.log('[REALTIME] 🌙 Page hidden at', new Date().toLocaleTimeString())
    }
    
    // Page vient de devenir visible - gérer la reconnexion
    if (becameVisible && reconnectOnVisibility && isConnected) {
      console.log('[REALTIME] 👁️ Page became visible, checking connection health...')
      
      // Calculer le VRAI temps passé caché
      const timeHidden = lastHiddenTimeRef.current 
        ? Date.now() - lastHiddenTimeRef.current 
        : 0
      
      const wasHiddenLongTime = timeHidden > 30000 // Plus de 30 secondes
      
      // TOUJOURS reconnecter si l'onglet était caché longtemps
      // Les connexions WebSocket sont souvent gelées par le navigateur après 30s
      if (wasHiddenLongTime) {
        console.log('[REALTIME] 🏥 Tab was hidden for', Math.round(timeHidden / 1000), 'seconds, forcing reconnection')
        
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
        console.log('[REALTIME] ✅ Short absence (', Math.round(timeHidden / 1000), 's), keeping connection')
      }
      
      // Réinitialiser le timestamp
      lastHiddenTimeRef.current = null
    }
    
    // Mettre à jour la référence APRÈS avoir vérifié les transitions
    wasVisibleRef.current = isVisible

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, isConnected, reconnectOnVisibility, reconnectDelay])

  return {
    isConnected,
    reconnect: connect,
    disconnect: cleanup,
    connectionState,
    checkHealth: checkConnectionHealth
  }
}
