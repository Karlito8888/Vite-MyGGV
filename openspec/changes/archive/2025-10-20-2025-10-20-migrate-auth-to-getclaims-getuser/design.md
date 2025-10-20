## Context
The project currently uses deprecated `supabase.auth.getSession()` across 10+ components and pages. Supabase has introduced asymmetric JWT signing and recommends `getClaims()` for better security and performance.

## Goals / Non-Goals
- Goals:
  - Replace all `getSession()` calls with `getClaims()` or `getUser()`
  - Improve authentication security through proper JWT verification
  - Enhance performance with local JWT verification
  - Align with Supabase's modern authentication patterns
- Non-Goals:
  - Changing authentication flow logic (login → onboarding → home)
  - Modifying RLS policies or database structure
  - Adding new authentication features
  - Changing UI/UX of authentication

## Decisions
- Decision: Use `getClaims()` as primary method for authentication checks
  - Why: Local JWT verification, better performance, proper security
  - Alternatives considered: `getUser()` only, mixed approach
- Decision: Use `getUser()` only when specific user metadata is needed
  - Why: Claims don't contain all user metadata, server call required
  - Alternatives considered: Store metadata in claims, separate database calls
- Decision: Create compatibility helpers for common authentication patterns
  - Why: Smooth migration, consistent API across components
  - Alternatives considered: Direct migration, complete rewrite

## Risks / Trade-offs
- Risk: Claims structure differs from session.user structure
  - Mitigation: Create helper functions to map common fields (id, email, role)
- Risk: Some components may expect user metadata not in claims
  - Mitigation: Use `getUser()` for metadata-heavy components
- Trade-off: Slightly different data structure vs significant security improvement
- Risk: Breaking changes during migration
  - Mitigation: Incremental migration with thorough testing

## Migration Strategy
1. **Phase 1**: Create authentication helper utilities
2. **Phase 2**: Update core authentication components (ProtectedRoute, AuthContext)
3. **Phase 3**: Migrate page components (Profile, Home, Onboarding, etc.)
4. **Phase 4**: Migrate utility components (Header, Navigation, etc.)
5. **Phase 5**: Update hooks and contexts
6. **Phase 6**: Remove any remaining getSession() calls

## Technical Implementation
- Replace `const { data: { session } } = await supabase.auth.getSession()` 
- With `const { data: { claims } } = await supabase.auth.getClaims()`
- Update user data extraction: `claims.email` instead of `session.user.email`
- Use `claims.sub` for user ID (standard JWT claim)
- Create `getUser()` calls when full user object needed

## Open Questions
- Should we create a compatibility layer or update all components directly?
- How to handle components that need both claims and user metadata?
- Should we cache getUser() results to avoid repeated server calls?