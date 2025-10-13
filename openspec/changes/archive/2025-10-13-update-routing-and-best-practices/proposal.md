# Proposal: Update Routing and Best Practices

## Why
The current implementation has two issues:
1. Onboarding page is protected by authentication, but it should be accessible immediately after login as part of the user setup flow
2. The codebase doesn't follow React 19 best practices (unnecessary React imports for JSX, StrictMode usage patterns)

## What Changes
- **Routing**: Remove ProtectedRoute wrapper from Onboarding page to allow access after login
- **React 19 Best Practices**: Remove unnecessary `import React` statements from JSX files (React 19 auto-imports JSX)
- **React 19 Best Practices**: Update StrictMode usage to follow React 19 patterns
- Verify React Router 7, Vite 7, and vite-plugin-pwa configurations against official documentation

## Impact
- Affected specs: `project-management` (routing system)
- Affected code:
  - `src/App.jsx` - Remove ProtectedRoute from Onboarding
  - `src/main.jsx` - Update React imports and StrictMode
  - `src/components/ProtectedRoute.jsx` - Remove unnecessary React import
  - `src/utils/AuthContext.jsx` - Remove unnecessary React import
  - All component files - Remove unnecessary React imports

## Validation
- User can access Onboarding immediately after login
- Home page remains protected
- No console warnings about React imports
- Application runs correctly with React 19 optimizations
