## ADDED Requirements
### Requirement: Onboarding Page Loading Transition
The system SHALL display a ClimbingBoxLoader for 3 seconds when users arrive on the onboarding page after login, regardless of their onboarding completion status.

#### Scenario: User arrives on onboarding page after login
- **WHEN** a user is redirected to the onboarding page after successful authentication
- **THEN** the system SHALL display the ClimbingBoxLoader component immediately
- **AND** the loader SHALL be displayed for exactly 3 seconds
- **AND** the system SHALL check the user's onboarding completion status during this time
- **AND** after 3 seconds, the system SHALL route the user based on their completion status

#### Scenario: Loader visual presentation
- **WHEN** the ClimbingBoxLoader is displayed
- **THEN** the loader SHALL be centered on the page
- **AND** the loader SHALL have appropriate styling for the application theme
- **AND** the page SHALL show only the loader without other content

### Requirement: Conditional Post-Loader Routing
The system SHALL implement intelligent routing after the 3-second loader based on the user's onboarding completion status.

#### Scenario: User with completed onboarding
- **WHEN** the 3-second loader completes and the user has already completed onboarding
- **THEN** the system SHALL redirect the user to the home page
- **AND** the redirection SHALL be seamless without showing the onboarding form
- **AND** the system SHALL log the routing decision for debugging

#### Scenario: User without completed onboarding
- **WHEN** the 3-second loader completes and the user has not completed onboarding
- **THEN** the system SHALL display the onboarding form
- **AND** the user SHALL be able to complete the onboarding process
- **AND** the system SHALL log the routing decision for debugging

## MODIFIED Requirements
### Requirement: Simple Onboarding Process Flow
The system SHALL provide a simple onboarding process that includes a loading transition and intelligent routing based on completion status.

#### Scenario: Enhanced onboarding entry flow
- **WHEN** a user arrives at the onboarding page after authentication
- **THEN** the system SHALL first display the ClimbingBoxLoader for 3 seconds
- **AND** check the user's onboarding completion status from the profiles table
- **AND** after the loader completes, route to home if onboarding is completed
- **AND** after the loader completes, show onboarding form if not completed
- **AND** maintain all existing onboarding form functionality for users who need it

#### Scenario: Onboarding completion status verification
- **WHEN** checking onboarding completion status during the loader period
- **THEN** the system SHALL query the public.profiles table for the onboarding_completed flag
- **AND** use the user's claims.sub as the identifier for the profile lookup
- **AND** handle any database errors gracefully during the check
- **AND** default to showing the onboarding form if status cannot be determined