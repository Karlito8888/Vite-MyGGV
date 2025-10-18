import { useEffect } from 'react'
import { useAuth } from '../utils/useAuth'
import { listActiveHeaderMessages } from '../services/messagesHeaderService'

// Hook to preload critical data for home page
export const usePreloadData = () => {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Preload header messages in background
      const preloadHeaderMessages = async () => {
        try {
          await listActiveHeaderMessages()
        } catch (error) {
          // Silent fail for preloading
          console.debug('Header messages preload failed:', error)
        }
      }

      // Use requestIdleCallback if available, otherwise setTimeout
      if (window.requestIdleCallback) {
        window.requestIdleCallback(preloadHeaderMessages)
      } else {
        setTimeout(preloadHeaderMessages, 100)
      }
    }
  }, [user])
}

// Hook to preload navigation icons
export const usePreloadIcons = () => {
  useEffect(() => {
    // Preload entire @heroicons/react package for better chunking
    // This avoids the dynamic import warnings and lets Vite handle it optimally
    const preloadIcons = () => {
      import('@heroicons/react/24/outline').catch(() => {
        // Ignore errors during preloading
      })
    }

    if (window.requestIdleCallback) {
      window.requestIdleCallback(preloadIcons)
    } else {
      setTimeout(preloadIcons, 200)
    }
  }, [])
}