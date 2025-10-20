## MODIFIED Requirements
### Requirement: Simplified Protected Route Access
Protected routes SHALL require only claims-based authentication without onboarding verification, with proper logging to verify route access behavior.

#### Scenario: Protected route access
- **WHEN** an authenticated user accesses any protected route
- **THEN** the system SHALL log route access attempt
- **AND** verify authentication using `getClaims()`
- **AND** allow access if user is authenticated
- **AND** not perform onboarding status checks
- **AND** log successful route access

#### Scenario: Route access debugging
- **WHEN** debugging route access issues
- **THEN** the system SHALL provide detailed logs about authentication status
- **AND** log user claims information
- **AND** indicate why access was granted or denied
- **AND** provide clear error messages for access failures