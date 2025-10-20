# Authentication System

## Purpose
Provide consistent authentication state management across all components using the modern `useAuth` hook pattern.
## Requirements
### Requirement: User Authentication State
The system SHALL provide user authentication state management through Supabase authentication using the modern `getClaims()` method with asymmetric JWT verification for optimal performance and security, with comprehensive logging for debugging authentication issues.

#### Scenario: User login with email and password
- **WHEN** a user provides valid email and password
- **THEN** the system SHALL authenticate the user using signInWithPassword
- **AND** log authentication attempt details to console for debugging
- **AND** verify authentication using `supabase.auth.getClaims()` instead of getUser()
- **AND** extract user data from `data.claims` structure (sub, email, role, etc.)
- **AND** log extracted user data to console
- **AND** provide claims-based user state to components without visual flashes
- **AND** redirect to onboarding page after successful authentication
- **AND** display loading states during authentication processing
- **AND** log any authentication errors to console

#### Scenario: Authentication state transitions
- **WHEN** authentication state changes (login/logout)
- **THEN** the system SHALL maintain loading states during transition
- **AND** log state transition details to console
- **AND** use `getClaims()` for fast local JWT verification
- **AND** prevent intermediate UI flashes
- **AND** ensure smooth visual transitions between auth states
- **AND** log successful state transitions

#### Scenario: OAuth authentication flow
- **WHEN** a user authenticates via OAuth provider
- **THEN** the system SHALL handle callback without showing login page flash
- **AND** log OAuth authentication attempt to console
- **AND** verify authentication using `getClaims()` method
- **AND** maintain loading state during OAuth processing
- **AND** redirect to onboarding page after successful auth
- **AND** log OAuth completion details

### Requirement: Real-time User Presence
The system SHALL provide real-time user presence tracking using Supabase Presence functionality integrated with Supabase UI authentication.

#### Scenario: User presence with Supabase UI
- **WHEN** a user authenticates using Supabase UI
- **THEN** the system SHALL subscribe to presence channels using Supabase UI user ID
- **AND** maintain presence state using Supabase UI auth state
- **AND** automatically handle presence cleanup on logout

### Requirement: Supabase UI Authentication Integration
The system SHALL use official Supabase UI components for all authentication functionality.

#### Scenario: Password-based authentication
- **WHEN** user accesses login page
- **THEN** the system SHALL display Supabase UI password authentication form
- **AND** handle email/password login using Supabase UI components
- **AND** provide built-in validation and error handling

#### Scenario: Social authentication
- **WHEN** user clicks social login button
- **THEN** the system SHALL use Supabase UI social auth components
- **AND** support Google and Facebook OAuth providers
- **AND** handle OAuth flow using Supabase UI patterns

#### Scenario: Authentication state management
- **WHEN** authentication state changes
- **THEN** the system SHALL use Supabase UI auth hooks
- **AND** provide consistent user state across components
- **AND** handle loading states automatically

### Requirement: Protected Route Integration
The system SHALL integrate Supabase UI authentication with protected route system.

#### Scenario: Route protection
- **WHEN** accessing protected routes
- **THEN** the system SHALL use Supabase UI auth state
- **AND** redirect unauthenticated users to login
- **AND** maintain smooth transitions during auth changes

#### Scenario: User data access
- **WHEN** components need user information
- **THEN** the system SHALL use Supabase UI user object
- **AND** provide user metadata and authentication status
- **AND** integrate with onboarding flow requirements

### Requirement: Simple Post-Authentication Redirection
The system SHALL always redirect users to the onboarding page after successful authentication, regardless of their onboarding completion status, with proper logging to verify redirection behavior.

#### Scenario: Successful login redirection
- **WHEN** a user successfully authenticates (email/password or social login)
- **THEN** the system SHALL log successful authentication event
- **AND** redirect to `/onboarding`
- **AND** log redirection attempt to console
- **AND** not check any completion flags before redirection
- **AND** verify redirection was successful

#### Scenario: Redirection failure handling
- **WHEN** redirection to onboarding fails
- **THEN** the system SHALL log redirection failure details
- **AND** provide fallback navigation options
- **AND** display appropriate error messages to user

### Requirement: Authentication Helper Utilities
Helper utilities SHALL be created to abstract claims extraction and provide compatibility during migration.
#### Scenario:
When multiple components need similar authentication patterns, provide helper functions to abstract claims extraction.

#### Scenario:
When components need user metadata not in claims, provide utility to safely call getUser() with proper error handling.

