## MODIFIED Requirements
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
The onboarding service SHALL handle avatar file uploads and storage.

#### Scenario: Avatar file processing
- **WHEN** a user submits the onboarding form with a new avatar
- **THEN** the onboarding service SHALL process the uploaded image file
- **AND** the service SHALL upload the processed avatar to the Supabase "avatars" bucket
- **AND** the service SHALL store the avatar URL in the user's profile
- **AND** the service SHALL handle upload errors gracefully

#### Scenario: Avatar storage management
- **WHEN** storing avatars in Supabase
- **THEN** the service SHALL use the "avatars" bucket with appropriate naming convention
- **AND** the service SHALL ensure proper file permissions and access controls
- **AND** the service SHALL handle duplicate file names appropriately
- **AND** the service SHALL maintain reasonable file sizes for storage efficiency

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