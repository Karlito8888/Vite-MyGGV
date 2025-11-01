import { useState, useEffect, useRef } from 'react'
import { PageVisibilityContext } from './PageVisibilityContextValue'
import { supabase } from '../utils/supabase'

/**
 * Provider pour partager l'état de visibilité de la page
 * Gère également la récupération de l'état d'authentification lors du retour sur l'onglet
 * Évite les multiples listeners et logs répétitifs
 */
export function PageVisibilityProvider({ children }) {
  const [isVisible, setIsVisible] = useState(!document.hidden)
  const lastVisibleTimeRef = useRef(null)
  const authRecoveryTimeoutRef = useRef(null)

  // Initialiser lastVisibleTimeRef dans un effet pour éviter l'appel impur pendant le render
  useEffect(() => {
    if (lastVisibleTimeRef.current === null) {
      lastVisibleTimeRef.current = Date.now()
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = async () => {
      const visible = !document.hidden
      
      // Un seul log pour toute l'app
      if (import.meta.env.DEV) {
        console.log('[VISIBILITY] 👁️ Page is now:', visible ? 'visible' : 'hidden')
      }

      if (visible) {
        // Calculer le temps passé en arrière-plan
        const timeHidden = Date.now() - lastVisibleTimeRef.current
        
        // Si l'onglet était caché pendant plus de 30 secondes, vérifier l'état d'auth
        if (timeHidden > 30000) {
          console.log('[VISIBILITY] 🔐 Tab was hidden for', Math.round(timeHidden / 1000), 'seconds, checking auth state...')
          
          // Ajouter un petit délai pour laisser le navigateur se réveiller
          if (authRecoveryTimeoutRef.current) {
            clearTimeout(authRecoveryTimeoutRef.current)
          }
          
          authRecoveryTimeoutRef.current = setTimeout(async () => {
            try {
              // Vérifier la session actuelle
              const { data: { session }, error } = await supabase.auth.getSession()
              
              if (error) {
                console.error('[VISIBILITY] ❌ Error checking session:', error)
                return
              }

              if (session) {
                // Vérifier si le token est proche de l'expiration (moins de 5 minutes)
                const expiresAt = session.expires_at * 1000 // Convertir en millisecondes
                const timeUntilExpiry = expiresAt - Date.now()
                
                if (timeUntilExpiry < 300000) { // Moins de 5 minutes
                  console.log('[VISIBILITY] 🔄 Token expiring soon, refreshing session...')
                  const { error: refreshError } = await supabase.auth.refreshSession()
                  
                  if (refreshError) {
                    console.error('[VISIBILITY] ❌ Error refreshing session:', refreshError)
                  } else {
                    console.log('[VISIBILITY] ✅ Session refreshed successfully')
                  }
                }
              } else {
                console.log('[VISIBILITY] ℹ️ No active session found')
              }
            } catch (error) {
              console.error('[VISIBILITY] ❌ Exception during auth recovery:', error)
            }
          }, 500) // Délai de 500ms pour laisser le navigateur se stabiliser
        }
        
        lastVisibleTimeRef.current = Date.now()
      }
      
      setIsVisible(visible)
    }

    // Écouter également l'événement focus pour une détection plus fiable
    const handleFocus = () => {
      if (document.hidden) return // Ignorer si le document est toujours caché
      
      if (import.meta.env.DEV) {
        console.log('[VISIBILITY] 🎯 Window focused')
      }
      
      // Déclencher la même logique que visibilitychange
      handleVisibilityChange()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      
      if (authRecoveryTimeoutRef.current) {
        clearTimeout(authRecoveryTimeoutRef.current)
      }
    }
  }, [])

  return (
    <PageVisibilityContext.Provider value={isVisible}>
      {children}
    </PageVisibilityContext.Provider>
  )
}

