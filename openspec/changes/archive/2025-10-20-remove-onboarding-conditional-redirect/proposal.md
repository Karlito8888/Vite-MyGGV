## Why
The current authentication system uses over-engineered conditional logic that checks the `onboarding_completed` flag to determine redirection after login. This complexity violates the project's "keep it simple" principles and creates unnecessary maintenance burden.

## What Changes
- Remove conditional redirection logic based on `onboarding_completed` status
- Simplify login flow to always redirect to onboarding page
- Remove complex state management for onboarding status in ProtectedRoute
- Eliminate unnecessary service calls to check onboarding completion

## Impact
- Affected specs: authentication, onboarding-flow
- Affected code: ProtectedRoute.jsx, Login.jsx, onboardingService.js
- **BREAKING**: Changes login flow behavior for all users