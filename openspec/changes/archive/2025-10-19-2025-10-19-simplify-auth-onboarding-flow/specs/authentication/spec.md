# Authentication System

## Purpose
Provide consistent authentication state management across all components using the modern `useAuth` hook pattern.

## Requirements

## MODIFIED

### Requirement: Authentication Hook Usage
All components SHALL use the `useAuth` hook for authentication state management instead of importing `AuthContext` directly.

#### Scenario: Component authentication access
- **WHEN** a component needs authentication state
- **THEN** it SHALL import `useAuth` from `../utils/useAuth`
- **AND** call `useAuth()` to get auth context
- **AND** NOT import `AuthContext` directly

#### Scenario: Consistent authentication pattern
- **WHEN** reviewing component authentication code
- **THEN** all components SHALL follow the same `useAuth` pattern
- **AND** no components shall use `useContext(AuthContext)`

### Requirement: Simplified Protected Route Logic
The ProtectedRoute component SHALL handle both authentication and onboarding checks using direct user object properties.

#### Scenario: Unauthenticated user access
- **WHEN** a user without authentication tries to access a protected route
- **THEN** the system SHALL check `if (!user)` 
- **AND** redirect to `/login` immediately
- **AND** not perform any async operations

#### Scenario: Authenticated user with incomplete onboarding
- **WHEN** an authenticated user with `onboarding_completed = false` accesses a protected route
- **THEN** the system SHALL check `if (!user.onboarding_completed)`
- **AND** redirect to `/onboarding` immediately
- **AND** not use caching or async status checks

#### Scenario: Authenticated user with completed onboarding
- **WHEN** an authenticated user with `onboarding_completed = true` accesses a protected route
- **THEN** the system SHALL render the children components
- **AND** not perform any additional checks
- **AND** allow immediate access to protected content

### Requirement: Simplified Auth Hook
The useAuth hook SHALL focus only on core authentication functionality.

#### Scenario: Auth hook cleanup
- **WHEN** refactoring useAuth
- **THEN** all onboarding-related methods SHALL be removed
- **INCLUDING** `checkOnboardingStatus`, `getOnboardingStatusWithCache`
- **AND** the hook SHALL only provide core auth state and methods

#### Scenario: Removal of combined hook
- **WHEN** simplifying authentication
- **THEN** `useAuthWithRedirect` SHALL be removed
- **AND** components SHALL use only `useAuth` for authentication needs

## REMOVED

### Requirement: Complex Caching System
The complex caching system for onboarding status is REMOVED.

#### Rationale
Onboarding status changes at most once per user and does not require complex caching mechanisms.

### Requirement: Real-time Redirect Listeners
The real-time redirect listener system is REMOVED.

#### Rationale
Simple notifications do not require real-time database subscriptions for a one-time event.

### Requirement: Separate Redirect Hook
The useOnboardingRedirect hook SHALL be completely removed from the codebase.

#### Rationale
ProtectedRoute can handle all necessary redirects without requiring a separate hook.