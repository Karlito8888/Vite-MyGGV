## Context
The project currently uses a mixed approach for authentication, combining `supabase.auth.getSession()`, manual user data extraction, and database calls for onboarding status. Supabase has introduced asymmetric JWT signing keys and the `getClaims()` method, which provides better performance and security.

## Goals / Non-Goals
- Goals: 
  - Migrate to modern Supabase `getClaims()` method exclusively
  - Improve authentication performance through local JWT verification
  - Align with Supabase's asymmetric JWT signing keys system
  - Simplify authentication code by removing mixed approaches
- Non-Goals:
  - Changing authentication flow logic (login → onboarding → home)
  - Modifying RLS policies or database structure
  - Adding new authentication features

## Decisions
- Decision: Use `getClaims()` instead of `getUser()` for all authentication operations
  - Why: Faster performance (local JWT verification vs server call), better security with asymmetric keys
  - Alternatives considered: Keep mixed approach, migrate to `getUser()` only
- Decision: Structure authentication data around `data.claims` instead of extracted user object
  - Why: Direct access to JWT claims, no data transformation needed
  - Alternatives considered: Transform claims to user object format

## Risks / Trade-offs
- Risk: Claims structure differs from user object structure - may require component updates
  - Mitigation: Map common fields (id, email, role) from claims structure
- Risk: Some user metadata may not be available in claims
  - Mitigation: Use database calls only when specific metadata is needed
- Trade-off: Slightly different data structure vs significant performance improvement

## Migration Plan
1. Update AuthContext to use `getClaims()` instead of `getSession()`
2. Modify user data extraction to use claims structure
3. Update onboarding status verification to use claims.user_id
4. Update all components consuming authentication data
5. Test all authentication flows (login, OAuth, protected routes)
6. Remove legacy getUser() calls

## Open Questions
- How to handle user metadata that's not available in JWT claims?
- Should we create a compatibility layer or update all components directly?