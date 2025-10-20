## Why
User reports that login data is not being logged to console and redirection to onboarding page is not working after authentication.

## What Changes
- Add comprehensive logging to authentication flow
- Fix redirection logic after successful login
- Debug authentication state transitions
- Ensure proper integration between Login component and UserContext

## Impact
- Affected specs: authentication, onboarding-flow
- Affected code: src/contexts/UserContext.jsx, src/components/Login.jsx, src/utils/authHelpers.js