import { useState, useEffect } from 'react'

/**
 * Hook personnalisé pour gérer l'installation de la PWA
 * Détecte si la PWA peut être installée et gère l'événement beforeinstallprompt
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  
  // Initialize isInstalled state directly to avoid setState in useEffect
  const [isInstalled, setIsInstalled] = useState(() => {
    // iOS
    if (window.navigator.standalone) {
      return true
    }
    // Android and other platforms
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true
    }
    // If in standalone mode, mark as installed
    const isStandalone = window.navigator.standalone || 
                        window.matchMedia('(display-mode: standalone)').matches
    
    if (isStandalone) {
      localStorage.setItem('pwa-installed', 'true')
      return true
    }
    
    // If not in standalone but marked as installed in localStorage,
    // user probably uninstalled the PWA
    // Clean localStorage to allow new invitation
    if (localStorage.getItem('pwa-installed') === 'true') {
      localStorage.removeItem('pwa-installed')
      localStorage.removeItem('pwa-install-prompted')
      localStorage.removeItem('pwa-install-dismissed-at')
    }
    
    return false
  })

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent browser's default install prompt
      e.preventDefault()
      // Save event for later use
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      localStorage.setItem('pwa-installed', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  /**
   * Afficher l'invite d'installation native
   */
  const promptInstall = async () => {
    if (!deferredPrompt) {
      return false
    }

    // Afficher l'invite d'installation
    deferredPrompt.prompt()

    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      localStorage.setItem('pwa-install-prompted', 'true')
      return true
    } else {
      console.log('User dismissed the install prompt')
      localStorage.setItem('pwa-install-prompted', 'true')
      localStorage.setItem('pwa-install-dismissed-at', Date.now().toString())
      return false
    }
  }

  /**
   * Vérifier si l'invite a déjà été montrée
   */
  const hasBeenPrompted = () => {
    return localStorage.getItem('pwa-install-prompted') === 'true'
  }

  /**
   * Vérifier si l'utilisateur a récemment refusé l'installation
   * (ne pas le déranger pendant 7 jours)
   */
  const wasRecentlyDismissed = () => {
    const dismissedAt = localStorage.getItem('pwa-install-dismissed-at')
    if (!dismissedAt) return false

    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    const timeSinceDismissed = Date.now() - parseInt(dismissedAt)
    return timeSinceDismissed < sevenDaysInMs
  }

  /**
   * Réinitialiser l'état de l'invite (pour les tests)
   */
  const resetPromptState = () => {
    localStorage.removeItem('pwa-install-prompted')
    localStorage.removeItem('pwa-install-dismissed-at')
  }

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    hasBeenPrompted,
    wasRecentlyDismissed,
    resetPromptState
  }
}
