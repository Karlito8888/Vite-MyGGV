import { useEffect } from 'react'

// usePreloadData hook removed - profile data is now loaded directly in UserContext

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