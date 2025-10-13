## Why

Users need the ability to switch between light and dark themes for better viewing comfort in different lighting conditions. This improves accessibility and user experience, especially for mobile users who may use the app in various environments.

## What Changes

- Add dark/light theme toggle system with localStorage persistence
- Create CSS custom properties (variables) for theme colors based on #50aa61 (green) and #f3c549 (yellow)
- Implement theme toggle button positioned absolutely in top-right of main content
- Add inline script in index.html to prevent FOUC (Flash of Unstyled Content)
- Update all existing CSS files to use theme-aware custom properties
- Modify PWA manifest theme-color based on active theme

## Impact

- Affected specs: **NEW** theme-system capability, pwa-configuration (MODIFIED)
- Affected code:
  - `index.html` - Add theme initialization script and meta theme-color
  - `src/styles/index.css` - Add CSS custom properties and theme classes
  - `src/styles/*.css` - Update all color values to use CSS variables
  - `src/components/ThemeToggle.jsx` - New component
  - `src/components/Layout.jsx` - Integrate theme toggle
  - `vite.config.js` - Update PWA manifest with theme colors
