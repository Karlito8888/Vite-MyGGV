# Refactor Onboarding Status Control and Redirection Logic

## Why

The current onboarding status control and redirection logic is fragmented across multiple files, leading to code duplication, maintenance complexity, and potential inconsistencies. This technical debt makes it difficult to ensure reliable onboarding flows and increases the risk of bugs when making changes.

## What Changes

This change centralizes all onboarding and redirection logic in the service layer, eliminating duplication and improving maintainability while preserving all existing functionality.

## Problem Statement

The current onboarding status control and redirection logic is fragmented across multiple files, leading to code duplication and complexity:

**Onboarding Status Control (3 files):**
- `src/services/onboardingService.js:60` - `getOnboardingStatus()`
- `src/utils/AuthContext.jsx:19` - `fetchOnboardingStatus()`
- `src/utils/AuthContext.jsx:15` - `onboardingCompleted` state

**Redirection Logic (3 files):**
- `src/components/ProtectedRoute.jsx:31` - Redirect to onboarding
- `src/utils/useAutoRedirect.js:29` - Redirect to home after approval
- `src/services/onboardingService.js:417` - `checkRedirectNeeded()`

## Current Issues

1. **Duplication**: `useAutoRedirect.js` and `onboardingService.js:417` both handle the `redirect_to_home` flag
2. **Complexity**: 3 different files to verify onboarding status
3. **Cohesion**: Redirection logic is scattered between components and services
4. **Maintenance**: Changes require updates in multiple locations

## Proposed Solution

Centralize all onboarding and redirection logic in `onboardingService.js` and simplify `useAutoRedirect.js` to be a React wrapper only.

## Benefits

- **Single Source of Truth**: All onboarding logic in one service
- **Reduced Duplication**: Eliminate redundant redirect flag handling
- **Better Maintainability**: Changes only need to be made in one place
- **Cleaner Architecture**: Clear separation between service logic and React components

## Scope

This change will:
1. Consolidate onboarding status checking in `onboardingService.js`
2. Centralize all redirection logic in the service layer
3. Simplify `useAutoRedirect.js` to be a thin React wrapper
4. Update `AuthContext.jsx` to use the centralized service
5. Maintain existing functionality while improving code organization

## Constraints

- Must maintain existing user experience
- No breaking changes to the API surface
- Follow project conventions (no TypeScript, simple architecture)
- Preserve real-time notification functionality