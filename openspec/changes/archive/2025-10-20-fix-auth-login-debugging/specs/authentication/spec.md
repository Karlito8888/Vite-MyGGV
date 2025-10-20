## MODIFIED Requirements
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