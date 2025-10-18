## Why
The codebase currently has inconsistent patterns for accessing PresenceContext data - some components use the protected `usePresence()` hook while others use `useContext(PresenceContext)` directly, creating potential runtime errors and maintenance issues.

## What Changes
- Replace direct `useContext(PresenceContext)` usage with `usePresence()` hook
- Ensure all components benefit from built-in provider validation
- Standardize context access pattern across the codebase

## Impact
- Affected specs: header-avatar-integration
- Affected code: src/components/Header.jsx:13
- Improves code safety and maintainability
- Eliminates potential runtime errors from missing provider