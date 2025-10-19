# Authentication Architecture Optimization

## Purpose
Optimize authentication architecture by creating centralized hooks and simplifying the context layer.

## ADDED Requirements

### Requirement: Centralized Redirect Hook
The system SHALL provide a `useOnboardingRedirect` hook that centralizes all onboarding and authentication redirect logic.

#### Scenario: Redirect hook initialization
- **WHEN** a component mounts and needs redirect functionality
- **THEN** the system SHALL provide `useOnboardingRedirect` hook
- **AND** the hook SHALL initialize with user authentication state
- **AND** SHALL check for existing redirect flags
- **AND** SHALL setup real-time redirect listeners

#### Scenario: Initial redirect check
- **WHEN** the hook mounts with an authenticated user
- **THEN** the system SHALL check for existing redirect flags using `onboardingService.checkAndHandleRedirect`
- **AND** SHALL handle any pending redirects immediately
- **AND** SHALL clear redirect flags after handling
- **AND** SHALL update internal redirect state accordingly

#### Scenario: Real-time redirect monitoring
- **WHEN** the hook is active with an authenticated user
- **THEN** the system SHALL setup real-time listeners using `onboardingService.setupRealtimeRedirectListener`
- **AND** SHALL monitor for redirect notifications
- **AND** SHALL handle redirect callbacks when notifications arrive
- **AND** SHALL cleanup listeners on unmount

#### Scenario: Hook return values
- **WHEN** components call `useOnboardingRedirect()`
- **THEN** the system SHALL return redirect state object
- **AND** SHALL include `hasShownNotification` boolean
- **AND** SHALL include `redirectNeeded` boolean
- **AND** SHALL include `loading` boolean for async operations
- **AND** SHALL provide `handleRedirect` function for manual triggers

### Requirement: Protected Route Hook
The system SHALL provide a `useProtectedRoute` hook that handles all route protection logic currently in the `ProtectedRoute` component.

#### Scenario: Route protection initialization
- **WHEN** a component needs route protection functionality
- **THEN** the system SHALL provide `useProtectedRoute` hook
- **AND** the hook SHALL access authentication state via `useAuth`
- **AND** SHALL determine route access eligibility
- **AND** SHALL provide loading states during verification

#### Scenario: Authentication verification
- **WHEN** checking if user can access protected routes
- **THEN** the system SHALL verify user authentication status
- **AND** SHALL check for valid user object
- **AND** SHALL handle authentication loading states
- **AND** SHALL prevent access during auth transitions

#### Scenario: Hook return values
- **WHEN** components call `useProtectedRoute()`
- **THEN** the system SHALL return protection state object
- **AND** SHALL include `canAccess` boolean for route access
- **AND** SHALL include `loading` boolean for verification status
- **AND** SHALL include `redirectTo` string for redirect destination
- **AND** SHALL include `reason` string for access denial reason

## MODIFIED Requirements

### Requirement: AuthContext Responsibility Focus
The `AuthContext` SHALL focus solely on core authentication state management.

#### Scenario: Core authentication state
- **WHEN** managing authentication state
- **THEN** the system SHALL maintain user authentication status
- **AND** SHALL handle claims-based user data
- **AND** SHALL manage social login methods
- **AND** SHALL provide basic auth event handling

#### Scenario: Onboarding logic removal
- **WHEN** simplifying AuthContext
- **THEN** the system SHALL remove onboarding status fetching
- **AND** SHALL remove onboarding state management
- **AND** SHALL remove onboarding-related loading states
- **AND** SHALL delegate onboarding logic to appropriate hooks

#### Scenario: State simplification
- **WHEN** managing context state
- **THEN** the system SHALL keep essential auth states (`user`, `loading`)
- **AND** SHALL remove specialized onboarding states
- **AND** SHALL streamline state transitions
- **AND** SHALL reduce state complexity

### Requirement: Enhanced useAuth Hook
The `useAuth` hook SHALL be enhanced to provide a unified authentication interface.

#### Scenario: Unified auth interface
- **WHEN** components need authentication functionality
- **THEN** the system SHALL provide enhanced `useAuth` hook
- **AND** SHALL include core authentication state from context
- **AND** SHALL integrate onboarding status via dedicated hooks
- **AND** SHALL provide unified loading states

#### Scenario: Hook composition
- **WHEN** enhancing useAuth functionality
- **THEN** the system SHALL use `useOnboardingRedirect` hook internally
- **AND** SHALL use `useProtectedRoute` hook for route protection
- **AND** SHALL compose multiple hooks for complete functionality
- **AND** SHALL maintain clean hook interfaces

#### Scenario: Backward compatibility
- **WHEN** enhancing useAuth hook
- **THEN** the system SHALL maintain existing interface
- **AND** SHALL preserve current return values
- **AND** SHALL not break existing component usage
- **AND** SHALL provide additional functionality seamlessly

## REMOVED Requirements

### Requirement: Inline Onboarding Status Fetching
Inline onboarding status fetching SHALL be removed from `AuthContext`.

#### Scenario: fetchOnboardingStatus removal
- **WHEN** reviewing AuthContext methods
- **THEN** the system SHALL remove `fetchOnboardingStatus` function
- **AND** SHALL remove onboarding status fetching from `initializeAuth`
- **AND** SHALL remove onboarding status fetching from auth state changes
- **AND** SHALL remove `onboardingCompleted` state from context

#### Scenario: Onboarding state cleanup
- **WHEN** cleaning up context state
- **THEN** the system SHALL remove `onboardingCompleted` state variable
- **AND** SHALL remove `setOnboardingCompleted` from context value
- **AND** SHALL remove onboarding-related loading states
- **AND** SHALL simplify auth state initialization

## Cross-Reference Requirements

This specification modifies requirements from:
- `openspec/specs/authentication/spec.md` - Enhances authentication flow and context
- Current `AuthContext.jsx` implementation
- Existing `useAuth` hook functionality
- Current `ProtectedRoute.jsx` component logic
- Existing `useAutoRedirect.js` functionality