# Migrate Auth from getSession to getClaims/getUser

## Summary
Replace deprecated `supabase.auth.getSession()` with modern `getClaims()` or `getUser()` methods to align with Supabase's asymmetric JWT signing keys and improve security/performance.

## Problem Statement
- `supabase.auth.getSession()` is deprecated and will be removed soon
- Current implementation doesn't match asymmetric JWT signing keys system
- Security warning: getSession may return untrusted data from insecure storage
- Performance opportunity: getClaims provides local JWT verification vs server calls

## Current State Analysis
Found 10+ files using `supabase.auth.getSession()`:
- Components: HamburgerButton, Navigation, Header, ProtectedRoute
- Pages: Profile, LocationRequests, Onboarding, Home
- Hooks: usePreloadData, PresenceContext

## Proposed Solution
Migrate to `getClaims()` as primary method with `getUser()` as fallback for specific user metadata needs.

## Benefits
- **Security**: Proper JWT verification with asymmetric keys
- **Performance**: Local verification vs server round-trips
- **Future-proof**: Aligns with Supabase's recommended approach
- **Maintainability**: Consistent authentication pattern across codebase

## Scope
- Replace all `getSession()` calls with `getClaims()` or `getUser()`
- Update authentication data structure to use claims format
- Maintain existing authentication flow and user experience
- No changes to RLS policies or database structure

## Dependencies
- Supabase JS client v2.78.0+ (for getClaims support)
- Existing authentication components and hooks

## Why
The migration is critical because:
- **Security Risk**: `getSession()` is deprecated and may return untrusted data from insecure storage
- **Breaking Change**: Supabase will remove `getSession()` in future versions, causing application failure
- **Performance Issues**: Current implementation requires server round-trips for authentication checks
- **Modern Standards**: Asymmetric JWT signing keys require proper client-side verification

## What Changes
- **Authentication Helpers**: Create `src/utils/authHelpers.js` with claims extraction utilities
- **Component Migration**: Update 10+ components to use `getClaims()` instead of `getSession()`
- **Data Structure**: Migrate from session objects to JWT claims format
- **Error Handling**: Implement proper error handling for claims verification failures
- **Compatibility**: Add fallback mechanisms for edge cases

## Timeline
Estimated 2-3 days for complete migration including testing.