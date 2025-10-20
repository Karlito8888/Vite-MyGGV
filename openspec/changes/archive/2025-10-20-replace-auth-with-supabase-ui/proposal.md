## Why
The current authentication system is overly complex with custom AuthContext, custom login forms, and manual state management. The official Supabase UI components provide pre-built, tested authentication components that will dramatically simplify the codebase while maintaining all current functionality.

## What Changes
- **BREAKING**: Replace entire custom authentication system with Supabase UI components
- Remove custom AuthContext.jsx and useAuth.js hook
- Replace Login.jsx with Supabase UI password-based and social auth components
- Update all components using useAuth to use new Supabase UI auth hooks
- Remove custom authentication state management and routing logic
- Simplify protected route system using Supabase UI patterns
- Maintain existing OAuth providers (Google, Facebook) and email/password auth
- Preserve onboarding flow integration

## Impact
- Affected specs: authentication
- Affected code: src/utils/AuthContext.jsx, src/utils/useAuth.js, src/pages/Login.jsx, src/components/ProtectedRoute.jsx, all components using useAuth
- **Major simplification**: Reduce authentication code by ~80%
- **Improved maintainability**: Use official, maintained components
- **Better UX**: Consistent with Supabase UI design patterns