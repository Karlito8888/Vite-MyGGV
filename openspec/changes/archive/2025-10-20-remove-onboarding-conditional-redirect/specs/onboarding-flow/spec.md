## REMOVED Requirements
### Requirement: Conditional Onboarding Flow
**Reason**: Over-engineered complexity that violates simple design principles
**Migration**: Replace with simple unconditional onboarding flow

The system SHALL implement conditional routing based on the user's `onboarding_completed` status during authentication.

#### Scenario: First-time user authentication
- **WHEN** a user authenticates with `onboarding_completed = false` or null
- **THEN** the system SHALL redirect to the onboarding page
- **AND** verify the `onboarding_completed` boolean field

#### Scenario: Returning user authentication
- **WHEN** a user authenticates with `onboarding_completed = true`
- **THEN** the system SHALL redirect to the home page
- **AND** skip the onboarding process

## MODIFIED Requirements
### Requirement: Onboarding Process Flow
The system SHALL provide a simple onboarding process that all users go through after login, regardless of their completion status.

#### Scenario: User completes onboarding
- **WHEN** a user finishes the onboarding process
- **THEN** `onboarding_completed` SHALL always be set to true
- **AND** the user can navigate to other pages
- **AND** set `onboarding_completed` to true using claims.sub

#### Scenario: User skips onboarding
- **WHEN** a user chooses to skip onboarding steps
- **THEN** the system SHALL still set `onboarding_completed` to true
- **AND** allow navigation to other pages