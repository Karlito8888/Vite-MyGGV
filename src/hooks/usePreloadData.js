import { useEffect } from 'react'
import { useAuth } from '../utils/useAuth'
import { getProfileById } from '../services/profilesService'
import { listLocations } from '../services/locationsService'


/**
 * Preload critical data for better UX
 * This hook runs in the background after the user lands on home to improve perceived performance
 * 
 * @returns {void} - This hook doesn't return anything, it performs data preloading as a side effect
 * 
 * @example
 * ```jsx
 * function Home() {
 *   usePreloadData(); // Preloads user profile and locations
 *   return <div>Home content</div>;
 * }
 * ```
 */
export function usePreloadData() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const preloadData = async () => {
      try {
        // Preload user profile data
        const profilePromise = getProfileById(user.id).catch(() => null)
        
        // Preload available locations for potential future use
        const locationsPromise = listLocations().catch(() => null)
        
        // Note: getUserLocationRequests removed due to SQL query issues
        // Location requests will be loaded when needed, not preloaded

        // Wait for all to complete (but don't block UI)
        await Promise.allSettled([
          profilePromise,
          locationsPromise
        ])
        
        console.debug('Data preloading completed for user:', user.id)
      } catch (error) {
        // Silent fail - preloading is optional
        console.debug('Preload data error:', error)
      }
    }

    // Delay preload slightly to prioritize initial render
    const timer = setTimeout(preloadData, 500)
    return () => clearTimeout(timer)
  }, [user])
}

/**
 * Preload icon images for better UX
 * Loads common icons used throughout the app to prevent loading delays
 * 
 * @returns {void} - This hook doesn't return anything, it performs icon preloading as a side effect
 * 
 * @example
 * ```jsx
 * function Home() {
 *   usePreloadIcons(); // Preloads app icons in the background
 *   return <div>Home content</div>;
 * }
 * ```
 */
export function usePreloadIcons() {
  useEffect(() => {
    const preloadIcons = () => {
      const iconPaths = [
        '/AppImages/ios/180.png',
        '/AppImages/android/android-launchericon-192-192.png',
        '/src/assets/logos/ggv-100.png',
        '/src/assets/logos/ggv-70.png',
        '/src/assets/img/house.png',
        '/src/assets/img/pin.png',
        '/src/assets/img/post.png',
        '/src/assets/img/smartphone.png',
        '/src/assets/img/money.png',
        '/src/assets/logos/coin.png',
        '/src/assets/logos/gps.png',
        '/src/assets/logos/facebook.png'
      ]

      iconPaths.forEach(path => {
        const img = new Image()
        img.src = path
      })
      
      console.debug('Icon preloading completed')
    }

    // Delay icon preload to prioritize critical content
    const timer = setTimeout(preloadIcons, 1000)
    return () => clearTimeout(timer)
  }, [])
}
