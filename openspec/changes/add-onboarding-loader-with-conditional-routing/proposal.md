## Why
Improve user experience by adding a smooth loading transition after login while implementing intelligent routing based on onboarding completion status.

## What Changes
- Add ClimbingBoxLoader component from react-spinners library
- Implement 3-second loader display on onboarding page arrival
- Add conditional routing logic after loader completes:
  - If user completed onboarding → redirect to home
  - If user hasn't completed onboarding → show onboarding form
- Modify onboarding page to handle loader state and routing logic

## Impact
- Affected specs: onboarding-flow, authentication
- Affected code: src/pages/Onboarding.jsx, package.json
- New dependency: react-spinners
- Enhanced user experience with smooth transitions
- Improved onboarding flow logic