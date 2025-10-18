## Why
Users experience a visual flash/skip back to the login page after successful authentication before being redirected to the appropriate destination (home or onboarding). This creates a jarring user experience and makes the authentication flow feel unpolished.

## What Changes
- Optimize authentication state management to prevent race conditions
- Implement smoother loading states during auth transitions
- Add proper loading indicators to prevent visual flashes
- Improve redirect logic to be more deterministic
- Add authentication state persistence during route transitions

## Impact
- Affected specs: authentication
- Affected code: AuthContext.jsx, Login.jsx, ProtectedRoute.jsx
- User experience: Smoother authentication flow without visual artifacts