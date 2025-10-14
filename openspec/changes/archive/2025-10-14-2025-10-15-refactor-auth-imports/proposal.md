## Why
The codebase currently has inconsistent authentication imports - some components use `AuthContext` while others use the modern `useAuth` hook. This creates maintenance overhead and potential bugs.

## What Changes
- Update all components to use `useAuth` hook instead of `AuthContext` import
- Remove `AuthContext` imports from Profile.jsx, Footer.jsx, and ProtectedRoute.jsx
- Follow the pattern already established in Header.jsx

## Impact
- Affected specs: authentication patterns
- Affected code: Profile.jsx, Footer.jsx, ProtectedRoute.jsx
- Improves code consistency and maintainability