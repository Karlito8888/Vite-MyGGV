# Onboarding Flow System

## Purpose
Implement a simple onboarding flow that all users go through after login, regardless of completion status.
## Requirements
### Requirement: Simple Onboarding Process Flow
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

### Requirement: Enhanced Onboarding Page
The onboarding page SHALL use the Avatar component instead of URL input for avatar selection.

#### Scenario: Avatar component integration
- **WHEN** displaying the onboarding form
- **THEN** the system SHALL replace the avatar_url input field with the Avatar component
- **AND** the Avatar component SHALL be configured for upload mode
- **AND** the component SHALL display the current avatar or default GGV logo
- **AND** users SHALL be able to upload new avatars through the component

#### Scenario: Avatar upload workflow
- **WHEN** a user clicks to upload a new avatar
- **THEN** the system SHALL open the basic square image cropper
- **AND** the user SHALL be able to crop their image to square format
- **AND** the cropped image SHALL be processed and prepared for upload
- **AND** the system SHALL validate image format and size before upload

#### Scenario: Default avatar display
- **WHEN** a user has no existing avatar in their profile
- **THEN** the onboarding page SHALL display the default GGV logo (src/assets/logos/ggv-100.png)
- **AND** the default avatar SHALL be properly sized and styled
- **AND** the system SHALL allow users to replace the default avatar with a custom upload

### Requirement: Onboarding Service
The onboarding service SHALL handle avatar file uploads, storage, and location assignment with comprehensive error handling.

#### Scenario: Enhanced error handling in onboarding service
- **WHEN** an error occurs during onboarding
- **THEN** the onboarding service SHALL provide detailed error messages
- **AND** SHALL log comprehensive debugging information
- **AND** SHALL handle avatar upload failures gracefully
- **AND** SHALL validate all required input fields before processing

#### Scenario: Consistent onboarding completion
- **WHEN** onboarding completes (both direct assignment and request scenarios)
- **THEN** `onboarding_completed` SHALL always be set to true
- **AND** users SHALL have access to the application
- **AND** subsequent status checks SHALL return consistent results
- **AND** the service SHALL remove duplicate method implementations

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

### Requirement: Location Information Collection
The system SHALL collect mandatory location information during onboarding.

#### Scenario: Location field validation
- **WHEN** a user submits the onboarding form
- **THEN** the system SHALL validate that block and lot fields are not empty
- **AND** ensure location data follows expected format
- **AND** show appropriate error messages for invalid location data

#### Scenario: Avatar file validation
- **WHEN** validating the onboarding form
- **THEN** the system SHALL validate uploaded avatar files instead of URLs
- **AND** the validation SHALL check for supported image formats (jpg, png, webp)
- **AND** the validation SHALL enforce reasonable file size limits
- **AND** the system SHALL provide clear error messages for invalid files

#### Scenario: Form submission with avatar
- **WHEN** submitting the onboarding form with avatar changes
- **THEN** the system SHALL include the processed avatar data in the submission
- **AND** the system SHALL handle both new uploads and existing avatars
- **AND** the form submission SHALL wait for avatar upload completion before proceeding
- **AND** the system SHALL provide appropriate loading states during upload

### Requirement: Claims-Based Onboarding Service
The onboarding service SHALL use claims-based user identification for all onboarding operations.

#### Scenario: Onboarding completion with claims
- **WHEN** completing onboarding process
- **THEN** the service SHALL use `data.claims.sub` as the user identifier
- **AND** update the user's profile with onboarding completion status
- **AND** set `onboarding_completed` to true using claims.sub
- **AND** handle avatar upload and location assignment with claims-based identification

### Requirement: Centralized Redirect Handling Service
The system SHALL provide a combined method in onboardingService.js that handles both redirect checking and flag clearing to eliminate duplication and ensure atomic operations.

#### Scenario:
When checking if redirect is needed, components SHALL call onboardingService.checkAndHandleRedirect() instead of separate check and clear operations.

#### Scenario:
When redirect flag is found, the service SHALL handle both notification and flag clearing in one atomic operation.

### Requirement: Real-time Redirect Listener Service
The onboardingService SHALL provide a centralized method for setting up real-time redirect listeners to prevent multiple components from creating duplicate Supabase channels.

#### Scenario:
When components need real-time redirect updates, they SHALL use onboardingService.setupRealtimeRedirectListener() instead of setting up their own Supabase channels.

#### Scenario:
When redirect notification is received via real-time updates, the service SHALL handle the complete flow including flag clearing.

## Cross-Reference Requirements

This specification extends the existing authentication requirements in `openspec/specs/authentication/spec.md`:
- Builds upon the authentication hook usage patterns
- Extends protected route functionality
- Maintains consistency with existing auth context patterns