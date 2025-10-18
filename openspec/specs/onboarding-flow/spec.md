# Onboarding Flow System

## Purpose
Implement a conditional onboarding flow that checks user completion status after login and routes users appropriately.
## Requirements
### Requirement: Post-Login Onboarding Check
The system SHALL check the user's onboarding completion status after successful authentication and redirect accordingly.

#### Scenario: New user login
- **WHEN** a user authenticates with `onboarding_completed = false` or null
- **THEN** the system SHALL redirect to `/onboarding` page
- **AND** the user SHALL not access protected routes until onboarding is completed

#### Scenario: Returning user login
- **WHEN** a user authenticates with `onboarding_completed = true`
- **THEN** the system SHALL redirect directly to `/home` page
- **AND** bypass the onboarding page

#### Scenario: Onboarding status verification
- **WHEN** checking onboarding status
- **THEN** the system SHALL fetch the user's profile from `public.profiles` table
- **AND** verify the `onboarding_completed` boolean field
- **AND** handle loading states appropriately

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

### Requirement: Protected Route Enhancement
Protected routes SHALL require both authentication and completed onboarding.

#### Scenario: Protected route access without onboarding
- **WHEN** an authenticated user with incomplete onboarding tries to access a protected route
- **THEN** the system SHALL redirect to `/onboarding` page
- **AND** preserve the intended destination for post-onboarding redirect

#### Scenario: Protected route access with onboarding
- **WHEN** an authenticated user with completed onboarding accesses a protected route
- **THEN** the system SHALL allow access to the requested route
- **AND** not redirect to onboarding

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

## Cross-Reference Requirements

This specification extends the existing authentication requirements in `openspec/specs/authentication/spec.md`:
- Builds upon the authentication hook usage patterns
- Extends protected route functionality
- Maintains consistency with existing auth context patterns