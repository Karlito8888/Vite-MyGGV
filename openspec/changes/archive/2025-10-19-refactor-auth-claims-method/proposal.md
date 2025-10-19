## Why
Refactor the authentication and onboarding verification process to use only Supabase's modern `getClaims()` method instead of mixing `getUser()` and session-based approaches. This aligns with Supabase's new asymmetric JWT signing keys system, improves performance, and provides better security for the non-professional PWA.

## What Changes
- Replace all `supabase.auth.getUser()` calls with `supabase.auth.getClaims()`
- Update authentication context to use `data.claims` instead of `data.user`
- Refactor onboarding status verification to use claims-based approach
- Remove legacy session-based user data extraction
- **BREAKING**: Changes authentication data structure from `user` object to `claims` object

## Impact
- Affected specs: authentication, onboarding-flow
- Affected code: src/utils/AuthContext.jsx, src/utils/useAuth.js, authentication-related components
- Performance improvement through local JWT verification instead of server calls
- Better alignment with Supabase's modern JWT signing keys system