## Why
Supabase strongly recommends using `getClaims()` instead of `getUser()` for better security, performance, and reliability. The new JWT signing keys system provides asymmetric key verification without server dependencies.

## What Changes
- Replace `getUser()` calls with `getClaims()` in authentication logic
- Update AuthContext to use claims-based verification
- Maintain backward compatibility during transition
- **BREAKING**: Changes authentication verification method

## Impact
- Affected specs: database-operations (authentication layer)
- Affected code: src/utils/AuthContext.jsx, authentication flows
- Security improvement: Better JWT verification with local validation
- Performance improvement: Reduced server calls for auth verification