import { useEffect, useCallback, useRef, useState } from 'react'
import { usePageVisibility } from './usePageVisibility'
import { useGlobalRealtimeManager } from './useGlobalRealtimeManager'
import { supabase } from '../utils/supabase'

/**
 * Hook spécialisé pour la récupération PWA lors du changement d'onglets
 * Combine la détection de visibilité avec la gestion des connexions Realtime
 * et la vérification de santé du client Supabase
 */
export function usePWATabRecovery() {
  const isVisible = usePageVisibility()
  const { isConnected, forceReconnectAll } = useGlobalRealtimeManager()
  const lastVisibilityRef = useRef(false) // Start as false to detect first visibility change
  const lastVisibleTimeRef = useRef(Date.now())
  const reconnectTimeoutRef = useRef(null)
  const visibilityChangeCountRef = useRef(0)
  const [isRecovering, setIsRecovering] = useState(false)

  // Vérifier si l'application est en mode PWA
  const isPWA = useCallback(() => {
    return window.navigator.standalone || 
           window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: minimal-ui)').matches
  }, [])

  /**
   * Vérifie la santé du client Supabase en tentant une requête simple
   * @returns {Promise<boolean>} true si le client est sain, false sinon
   */
  const checkSupabaseHealth = useCallback(async () => {
    try {
      const startTime = Date.now()
      
      // Tentative de requête simple avec timeout de 5 secondes
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      )
      
      // Utiliser getClaims() au lieu de getSession() (recommandé par Supabase)
      const healthCheckPromise = supabase.auth.getClaims()
      
      const result = await Promise.race([healthCheckPromise, timeoutPromise])
      
      const responseTime = Date.now() - startTime
      
      if (responseTime > 3000) {
        console.log('[PWA-RECOVERY] ⚠️ Slow Supabase response:', responseTime, 'ms')
        return false
      }
      
      if (result.error) {
        console.error('[PWA-RECOVERY] ❌ Supabase health check error:', result.error)
        return false
      }
      
      console.log('[PWA-RECOVERY] ✅ Supabase health check passed:', responseTime, 'ms')
      return true
    } catch (error) {
      console.error('[PWA-RECOVERY] ❌ Supabase health check failed:', error.message)
      return false
    }
  }, [])

  /**
   * Rafraîchit la session Supabase si nécessaire
   * @returns {Promise<boolean>} true si le rafraîchissement a réussi, false sinon
   */
  const refreshSupabaseSession = useCallback(async () => {
    try {
      console.log('[PWA-RECOVERY] 🔄 Refreshing Supabase session...')
      
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('[PWA-RECOVERY] ❌ Session refresh failed:', error)
        return false
      }
      
      if (data.session) {
        console.log('[PWA-RECOVERY] ✅ Session refreshed successfully')
        return true
      }
      
      console.log('[PWA-RECOVERY] ℹ️ No session to refresh')
      return false
    } catch (error) {
      console.error('[PWA-RECOVERY] ❌ Exception during session refresh:', error)
      return false
    }
  }, [])

  // Gérer la récupération lors du retour sur l'onglet
  const handleTabRecovery = useCallback(async () => {
    console.log('[PWA-RECOVERY] 🔍 handleTabRecovery called - isVisible:', isVisible, 'lastVisibilityRef:', lastVisibilityRef.current)
    
    if (!isVisible) {
      console.log('[PWA-RECOVERY] ⏸️ Page not visible, skipping recovery')
      return
    }

    const wasHidden = !lastVisibilityRef.current
    console.log('[PWA-RECOVERY] 🔍 wasHidden:', wasHidden, '(calculated from !lastVisibilityRef.current)')
    
    lastVisibilityRef.current = isVisible

    if (!wasHidden) {
      console.log('[PWA-RECOVERY] ⏸️ Page was not hidden (no transition), skipping recovery')
      return // N'agit que si on passe de caché à visible
    }

    visibilityChangeCountRef.current += 1
    const changeCount = visibilityChangeCountRef.current
    
    // Calculer le temps passé en arrière-plan
    const timeHidden = Date.now() - lastVisibleTimeRef.current
    lastVisibleTimeRef.current = Date.now()

    console.log(`[PWA-RECOVERY] 👁️ Tab recovery #${changeCount} - PWA: ${isPWA()} - Hidden for: ${Math.round(timeHidden / 1000)}s`)

    // Vérifier l'état des connexions
    const connectionStatus = Object.values(isConnected)
    const connectedCount = connectionStatus.filter(Boolean).length
    const totalCount = connectionStatus.length

    console.log(`[PWA-RECOVERY] 📊 Connections: ${connectedCount}/${totalCount} active`)

    // Déterminer le délai de reconnexion basé sur le contexte
    let reconnectDelay = 500 // Délai par défaut

    if (isPWA()) {
      // En mode PWA, utiliser un délai plus court pour une meilleure expérience
      reconnectDelay = 200
    } else {
      // En mode navigateur, utiliser un délai plus long pour éviter les reconnexions excessives
      reconnectDelay = 1000
    }

    // Ajuster le délai en fonction du nombre de changements de visibilité
    if (changeCount > 10) {
      reconnectDelay = 1500 // Réduire la fréquence si trop de changements
    }

    console.log(`[PWA-RECOVERY] ⏰ Scheduling recovery in ${reconnectDelay}ms`)

    // Programmer la récupération
    reconnectTimeoutRef.current = setTimeout(async () => {
      setIsRecovering(true)
      
      try {
        console.log('[PWA-RECOVERY] 🔄 Executing tab recovery...')
        
        // 1. Vérifier la santé du client Supabase si l'onglet était caché longtemps
        if (timeHidden > 30000) { // Plus de 30 secondes
          console.log('[PWA-RECOVERY] 🏥 Checking Supabase health...')
          const isHealthy = await checkSupabaseHealth()
          
          if (!isHealthy) {
            console.log('[PWA-RECOVERY] 🔧 Supabase client appears frozen, refreshing session...')
            await refreshSupabaseSession()
          }
        }
        
        // 2. TOUJOURS reconnecter les canaux Realtime si l'onglet était caché > 30s
        // Les WebSockets sont souvent gelés par le navigateur après cette durée
        if (timeHidden > 30000) {
          console.log('[PWA-RECOVERY] 🔌 Tab was hidden > 30s, forcing Realtime reconnection...')
          forceReconnectAll()
        } else if (connectedCount < totalCount) {
          console.log('[PWA-RECOVERY] 🔌 Some connections down, reconnecting...')
          forceReconnectAll()
        } else {
          console.log('[PWA-RECOVERY] ✅ Short absence and all connections up, no reconnection needed')
        }
        
        console.log('[PWA-RECOVERY] ✅ Recovery completed')
      } catch (error) {
        console.error('[PWA-RECOVERY] ❌ Recovery failed:', error)
      } finally {
        setIsRecovering(false)
      }
    }, reconnectDelay)
  }, [isVisible, isConnected, forceReconnectAll, isPWA, checkSupabaseHealth, refreshSupabaseSession])

  // Nettoyer les timeouts lors du changement de visibilité
  const handleVisibilityChange = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    // Programmer la récupération
    handleTabRecovery()
  }, [handleTabRecovery])

  // Effet principal pour gérer les changements de visibilité
  useEffect(() => {
    handleVisibilityChange()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [isVisible, handleVisibilityChange])

  // Effet pour le focus de la fenêtre (cas particulier pour PWA)
  useEffect(() => {
    const handleWindowFocus = () => {
      console.log('[PWA-RECOVERY] 🎯 Window focused')
      // Forcer une vérification immédiate lors du focus
      if (isVisible) {
        handleTabRecovery()
      }
    }

    const handleWindowBlur = () => {
      console.log('[PWA-RECOVERY] 🎯 Window blurred')
    }

    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      window.removeEventListener('focus', handleWindowFocus)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [isVisible, handleTabRecovery])

  // Fonction pour forcer manuellement la récupération
  const forceRecovery = useCallback(async () => {
    console.log('[PWA-RECOVERY] 🚀 Manual recovery triggered')
    setIsRecovering(true)
    
    try {
      visibilityChangeCountRef.current = 0 // Réinitialiser le compteur
      
      // Vérifier et rafraîchir la session
      const isHealthy = await checkSupabaseHealth()
      if (!isHealthy) {
        await refreshSupabaseSession()
      }
      
      // Reconnecter tous les canaux
      forceReconnectAll()
      
      console.log('[PWA-RECOVERY] ✅ Manual recovery completed')
    } catch (error) {
      console.error('[PWA-RECOVERY] ❌ Manual recovery failed:', error)
    } finally {
      setIsRecovering(false)
    }
  }, [forceReconnectAll, checkSupabaseHealth, refreshSupabaseSession])

  // Fonction pour obtenir des statistiques
  const getRecoveryStats = useCallback(() => {
    return {
      isPWA: isPWA(),
      isVisible,
      visibilityChangeCount: visibilityChangeCountRef.current,
      connections: isConnected,
      healthyConnections: Object.values(isConnected).filter(Boolean).length,
      totalConnections: Object.values(isConnected).length
    }
  }, [isPWA, isVisible, isConnected])

  return {
    forceRecovery,
    getRecoveryStats,
    isPWA: isPWA(),
    isVisible,
    isRecovering,
    checkSupabaseHealth,
    refreshSupabaseSession
  }
}