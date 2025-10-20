# Migration Tasks

## Phase 1: Foundation (Priority: High)
1. **Create authentication helper utilities** ✅
   - Create `src/utils/authHelpers.js` with claims extraction functions
   - Add compatibility functions for common patterns
   - Add error handling for claims verification
   - Test helper functions with sample JWT claims

2. **Update core authentication setup** ✅
   - Update `src/utils/supabase.js` if needed for new methods
   - Ensure Supabase client version supports getClaims()
   - Test getClaims() method availability and functionality

## Phase 2: Core Components (Priority: High)
3. **Migrate ProtectedRoute component** ✅
   - Replace getSession() with getClaims() in `src/components/ProtectedRoute.jsx`
   - Update authentication logic to use claims structure
   - Test protected route access and redirects

4. **Update authentication hooks** ✅
   - Migrate `src/hooks/useProtectedRoute.js` to use claims
   - Update `src/hooks/usePreloadData.js` authentication checks
   - Test hook behavior with claims-based authentication

## Phase 3: Page Components (Priority: Medium)
5. **Migrate Profile page** ✅
   - Update `src/pages/Profile.jsx` to use getClaims()
   - Handle user metadata extraction from claims vs getUser()
   - Test profile page loading and user data display

6. **Migrate Home page** ✅
   - Update `src/pages/Home.jsx` authentication checks
   - Ensure user data extraction works with claims
   - Test home page with authenticated/unauthenticated states

7. **Migrate Onboarding page** ✅
   - Update `src/pages/Onboarding.jsx` authentication logic
   - Verify onboarding flow works with claims-based auth
   - Test onboarding completion and redirection

8. **Migrate LocationRequests page** ✅
   - Update `src/pages/LocationRequests.jsx` authentication
   - Test location requests functionality with new auth method

## Phase 4: UI Components (Priority: Medium)
9. **Migrate Header component** ✅
   - Update `src/components/Header.jsx` to use claims
   - Handle user display name/email extraction from claims
   - Test header user display and logout functionality

10. **Migrate Navigation component** ✅
    - Update `src/components/Navigation.jsx` authentication state
    - Test navigation link visibility based on auth state

11. **Migrate HamburgerButton component** ✅
    - Update `src/components/HamburgerButton.jsx` authentication checks
    - Test mobile menu behavior with new auth method

## Phase 5: Context and Utilities (Priority: Low)
12. **Update PresenceContext** ✅
    - Migrate `src/utils/PresenceContext.jsx` to use claims
    - Test presence functionality with claims-based authentication

13. **Remove legacy getSession calls** ✅
    - Search and remove any remaining getSession() usage
    - Ensure no deprecated patterns remain in codebase

## Phase 6: Testing and Validation (Priority: High)
14. **Test authentication flows** ✅
    - Test login flow with claims-based authentication
    - Test OAuth providers (if used) with new auth method
    - Test logout functionality and session cleanup

15. **Test protected routes** ✅
    - Verify all protected routes work with claims authentication
    - Test route protection and redirection logic
    - Test edge cases (expired tokens, invalid claims)

16. **Performance validation** ✅
    - Verify authentication performance improvement
    - Test local JWT verification speed
    - Ensure no unnecessary server calls

## Dependencies
- Task 3 depends on Task 1-2 (helpers must exist first)
- Tasks 5-8 depend on Task 3-4 (core components first)
- Tasks 9-11 depend on Tasks 5-8 (pages first)
- Task 14-16 depend on all previous tasks (complete migration needed)

## Validation Criteria
- All getSession() calls removed from codebase
- All authentication flows work correctly
- Performance improvement measurable
- No security vulnerabilities introduced
- Existing functionality preserved