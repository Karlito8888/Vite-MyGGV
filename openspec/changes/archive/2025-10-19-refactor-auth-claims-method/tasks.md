## 1. Authentication Context Refactoring
- [x] 1.1 Replace `getSession()` with `getClaims()` in AuthContext initialization
- [x] 1.2 Update user data extraction to use `data.claims` structure
- [x] 1.3 Modify auth state change handler to use claims-based approach
- [x] 1.4 Update authentication context value to provide claims instead of user object

## 2. Onboarding Status Verification Update
- [x] 2.1 Refactor onboarding status check to use claims.user_id instead of user.id
- [x] 2.2 Update fetchOnboardingStatus function to work with claims structure
- [x] 2.3 Modify protected route logic to use claims-based authentication

## 3. Component Updates
- [x] 3.1 Update useAuth hook to work with claims-based context
- [x] 3.2 Review and update all components using authentication data
- [x] 3.3 Ensure consistent claims.data usage across all authentication flows

## 4. Testing and Validation
- [x] 4.1 Verify login flow works with claims-based authentication
- [x] 4.2 Test onboarding status verification with new approach
- [x] 4.3 Validate OAuth authentication flows
- [x] 4.4 Ensure protected routes function correctly

## 5. Cleanup
- [x] 5.1 Remove any remaining getUser() calls
- [x] 5.2 Clean up legacy session-based code
- [x] 5.3 Update comments and documentation to reflect claims-based approach