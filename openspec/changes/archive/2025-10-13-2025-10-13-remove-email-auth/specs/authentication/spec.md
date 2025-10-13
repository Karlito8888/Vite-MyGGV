## REMOVED Requirements

### Requirement: Email/Password Authentication

The system SHALL NOT provide email/password authentication functionality including sign up, sign in, password reset, and email confirmation flows.

#### Scenario: Email/password sign up removal
- **WHEN** user visits the Login page
- **THEN** the system SHALL NOT display email/password sign up form
- **AND** the system SHALL NOT provide email/password registration functionality
- **AND** the system SHALL NOT send email confirmation links

#### Scenario: Email/password sign in removal  
- **WHEN** user attempts to authenticate
- **THEN** the system SHALL NOT accept email/password credentials
- **AND** the system SHALL NOT provide email/password login functionality
- **AND** the system SHALL NOT validate email format or password strength

#### Scenario: Password reset removal
- **WHEN** user needs to recover access
- **THEN** the system SHALL NOT provide password reset functionality
- **AND** the system SHALL NOT send password reset emails
- **AND** the system SHALL NOT handle password change flows

#### Scenario: Email confirmation removal
- **WHEN** user registration occurs
- **THEN** the system SHALL NOT require email confirmation
- **AND** the system SHALL NOT handle email verification states
- **AND** the system SHALL NOT display confirmation messages

## MODIFIED Requirements

### Requirement: Social-Only Authentication

The system SHALL provide authentication exclusively through social OAuth providers (Google, Facebook) with simplified user interface and maintained security.

#### Scenario: Social login preservation
- **WHEN** user visits the Login page
- **THEN** the system SHALL display only Google and Facebook login options
- **AND** the system SHALL handle OAuth redirects properly
- **AND** the system SHALL maintain existing social authentication flows

#### Scenario: Authentication context simplification
- **WHEN** authentication state is managed
- **THEN** the AuthContext SHALL remove email/password methods
- **AND** the AuthContext SHALL preserve social login methods
- **AND** the AuthContext SHALL maintain claims-based verification

#### Scenario: Protected routing preservation
- **WHEN** user accesses protected routes
- **THEN** the system SHALL require authentication via social providers
- **AND** the system SHALL redirect unauthenticated users to login
- **AND** the system SHALL maintain existing RLS policies