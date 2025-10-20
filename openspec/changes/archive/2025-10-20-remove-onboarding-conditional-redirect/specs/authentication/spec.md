## REMOVED Requirements
### Requirement: Conditional Post-Login Redirection
**Reason**: Over-engineered complexity that violates simple design principles
**Migration**: Replace with simple unconditional redirection to onboarding

The system SHALL check the user's `onboarding_completed` status during authentication and redirect accordingly.

#### Scenario: User with incomplete onboarding
- **WHEN** an authenticated user with `onboarding_completed = false` accesses a protected route
- **THEN** the system SHALL check `if (!user.onboarding_completed)`
- **AND** redirect to `/onboarding`

#### Scenario: User with completed onboarding
- **WHEN** an authenticated user with `onboarding_completed = true` accesses a protected route
- **THEN** the system SHALL allow access to protected routes
- **AND** not redirect to onboarding

## ADDED Requirements
### Requirement: Simple Post-Login Redirection
The system SHALL always redirect users to the onboarding page after successful authentication, regardless of their onboarding completion status.

#### Scenario: Successful login redirection
- **WHEN** a user successfully authenticates (email/password or social login)
- **THEN** the system SHALL redirect to `/onboarding`
- **AND** not check any completion flags before redirection

#### Scenario: Protected route access
- **WHEN** an authenticated user accesses any protected route
- **THEN** the system SHALL allow access if user is authenticated
- **AND** not perform onboarding status checks