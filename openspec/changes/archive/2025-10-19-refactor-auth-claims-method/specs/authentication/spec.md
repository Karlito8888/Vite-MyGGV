## MODIFIED Requirements
### Requirement: User Authentication State
The system SHALL provide user authentication state management through Supabase authentication using the modern `getClaims()` method with asymmetric JWT verification for optimal performance and security.

#### Scenario: User login with email and password
- **WHEN** a user provides valid email and password
- **THEN** the system SHALL authenticate the user using signInWithPassword
- **AND** verify authentication using `supabase.auth.getClaims()` instead of getUser()
- **AND** extract user data from `data.claims` structure (sub, email, role, etc.)
- **AND** provide claims-based user state to components without visual flashes
- **AND** redirect to appropriate page based on onboarding status seamlessly
- **AND** display loading states during authentication processing

#### Scenario: Authentication state transitions
- **WHEN** authentication state changes (login/logout)
- **THEN** the system SHALL maintain loading states during transition
- **AND** use `getClaims()` for fast local JWT verification
- **AND** prevent intermediate UI flashes
- **AND** ensure smooth visual transitions between auth states

#### Scenario: OAuth authentication flow
- **WHEN** a user authenticates via OAuth provider
- **THEN** the system SHALL handle callback without showing login page flash
- **AND** verify authentication using `getClaims()` method
- **AND** maintain loading state during OAuth processing
- **AND** redirect to appropriate destination after successful auth

### Requirement: Authentication Context
The authentication context SHALL manage user authentication state using claims-based data structure from Supabase's `getClaims()` method.

#### Scenario: Claims-based authentication
- **WHEN** a user successfully authenticates
- **THEN** the system SHALL call `supabase.auth.getClaims()` to verify JWT
- **AND** extract user information from `data.claims` (sub for user ID, email, role, etc.)
- **AND** the authentication context SHALL provide claims-based state to child components
- **AND** initialize presence tracking using claims.sub as user identifier

#### Scenario: Authentication cleanup
- **WHEN** a user logs out or authentication expires
- **THEN** the system SHALL clear claims-based authentication state
- **AND** unsubscribe from presence channels
- **AND** release all authentication-related resources

### Requirement: Authentication Loading States
The system SHALL provide consistent loading states during all authentication operations using the faster `getClaims()` method for JWT verification.

#### Scenario: Claims verification in progress
- **WHEN** verifying JWT claims using `getClaims()`
- **THEN** the system SHALL display appropriate loading indicator
- **AND** prevent navigation away from current view
- **AND** maintain UI stability until verification completes

#### Scenario: Authentication verification
- **WHEN** verifying authentication state or onboarding status
- **THEN** the system SHALL use `getClaims()` for fast local verification
- **AND** show loading state during claims processing
- **AND** prevent route changes during verification
- **AND** only redirect after verification is complete

### Requirement: Seamless Route Transitions
The system SHALL handle route transitions during authentication using claims-based verification without visual artifacts.

#### Scenario: Post-authentication redirect
- **WHEN** user successfully authenticates
- **THEN** the system SHALL verify JWT using `getClaims()` locally
- **AND** redirect directly to destination page
- **AND** bypass intermediate login page display
- **AND** maintain loading state during redirect

#### Scenario: Protected route access
- **WHEN** accessing protected routes during auth state changes
- **THEN** the system SHALL use claims-based authentication verification
- **AND** handle transitions smoothly
- **AND** prevent flashing between login and protected content
- **AND** show appropriate loading states

## ADDED Requirements
### Requirement: Claims-Based User Data Structure
The system SHALL use the claims structure from `getClaims()` as the primary source of user authentication data.

#### Scenario: User data extraction from claims
- **WHEN** extracting user information from JWT claims
- **THEN** the system SHALL use `data.claims.sub` for user ID
- **AND** use `data.claims.email` for user email
- **AND** use `data.claims.role` for user role
- **AND** use `data.claims.user_metadata` for custom metadata
- **AND** use `data.claims.app_metadata` for application metadata

#### Scenario: Claims verification fallback
- **WHEN** `getClaims()` fails or returns no claims
- **THEN** the system SHALL handle authentication as unauthenticated
- **AND** set user state to null
- **AND** clear any existing authentication data