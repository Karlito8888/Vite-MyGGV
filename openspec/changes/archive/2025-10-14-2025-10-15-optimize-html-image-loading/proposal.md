## Why
The current index.html uses a generic Vite favicon while the project has comprehensive PWA icons configured in vite.config.js. Optimizing HTML image loading will improve initial page load performance and provide proper branding before the PWA fully loads.

## What Changes
- Update index.html favicon to use project-specific icon from AppImages
- Add preloading for critical icons to improve perceived performance
- Ensure proper icon hierarchy for different platforms
- Maintain compatibility with existing Vite PWA configuration

## Impact
- Affected specs: pwa-configuration
- Affected code: index.html, potentially vite.config.js
- Improved user experience with proper favicon display
- Better loading performance for PWA icons