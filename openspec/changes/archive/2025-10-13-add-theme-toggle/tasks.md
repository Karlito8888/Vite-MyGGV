## 1. Theme System Foundation
- [x] 1.1 Add CSS custom properties for light/dark themes in `src/styles/index.css`
- [x] 1.2 Create theme initialization script in `index.html` to prevent FOUC
- [x] 1.3 Add meta theme-color tag in `index.html` with dynamic color support

## 2. Theme Toggle Component
- [x] 2.1 Create `src/components/ThemeToggle.jsx` with sun/moon icons
- [x] 2.2 Implement localStorage persistence logic
- [x] 2.3 Style toggle button for absolute positioning (top-right)
- [x] 2.4 Add smooth transition animations

## 3. Layout Integration
- [x] 3.1 Import ThemeToggle in `src/components/Layout.jsx`
- [x] 3.2 Position toggle in main content area (absolute, top-right)
- [x] 3.3 Ensure toggle is accessible on all protected routes

## 4. CSS Migration
- [x] 4.1 Update `src/styles/index.css` to use CSS variables
- [x] 4.2 Update `src/styles/Login.css` to use CSS variables
- [x] 4.3 Update `src/styles/Header.css` to use CSS variables
- [x] 4.4 Update `src/styles/Footer.css` to use CSS variables
- [x] 4.5 Update `src/styles/Home.css` to use CSS variables
- [x] 4.6 Update `src/styles/Profile.css` to use CSS variables
- [x] 4.7 Update `src/styles/Onboarding.css` to use CSS variables

## 5. PWA Integration
- [x] 5.1 Update `vite.config.js` PWA manifest with theme_color for light/dark
- [x] 5.2 Test theme persistence across PWA installs
- [x] 5.3 Verify theme-color meta tag updates correctly

## 6. Testing & Validation
- [x] 6.1 Test theme toggle on all pages (Login, Onboarding, Home, Profile)
- [x] 6.2 Verify localStorage persistence across sessions
- [x] 6.3 Test on mobile devices (iOS/Android)
- [x] 6.4 Verify no FOUC on page load
- [x] 6.5 Test color contrast for accessibility (WCAG AA compliance)
