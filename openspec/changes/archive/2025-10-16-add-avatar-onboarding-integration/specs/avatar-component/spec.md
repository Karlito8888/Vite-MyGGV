## ADDED Requirements
### Requirement: Avatar Upload Integration
The Avatar component SHALL support file upload functionality for onboarding flow integration.

#### Scenario: Avatar upload mode
- **WHEN** the Avatar component is used in upload mode
- **THEN** the component SHALL accept an `onUpload` callback prop
- **AND** the component SHALL display an upload button when no avatar is provided
- **AND** the component SHALL trigger file selection when upload button is clicked
- **AND** the component SHALL support image file validation (type, size)

#### Scenario: Default avatar fallback
- **WHEN** no avatar URL is provided and no custom fallback is specified
- **THEN** the Avatar component SHALL display the default GGV logo (src/assets/logos/ggv-100.png)
- **AND** the default avatar SHALL be used consistently across the application
- **AND** the component SHALL maintain proper sizing and styling for the default avatar

### Requirement: Basic Square Image Cropper
A basic square image cropper component SHALL be created for avatar upload functionality.

#### Scenario: Image cropping interface
- **WHEN** a user selects an image for avatar upload
- **THEN** the cropper SHALL display the image in a square aspect ratio
- **AND** the user SHALL be able to drag and resize the crop area
- **AND** the cropper SHALL provide basic crop controls (zoom, position)
- **AND** the cropper SHALL generate a square cropped image output

#### Scenario: Cropper integration
- **WHEN** the cropper is integrated with the Avatar component
- **THEN** it SHALL accept image files as input
- **AND** it SHALL return cropped image data as blob or base64
- **AND** it SHALL maintain reasonable file size for avatar storage
- **AND** it SHALL provide cancel and confirm actions

## MODIFIED Requirements
### Requirement: Avatar Component Interface
The Avatar component SHALL accept additional props for upload functionality.

#### Scenario: Upload props integration
- **WHEN** the Avatar component is used with upload functionality
- **THEN** it SHALL accept `onUpload`, `uploadMode`, and `defaultAvatar` props
- **AND** the component SHALL maintain backward compatibility with existing props
- **AND** the component SHALL provide appropriate UI for upload mode
- **AND** the component SHALL handle file selection and processing

#### Scenario: Dynamic avatar updates
- **WHEN** a new avatar is uploaded through the component
- **THEN** the Avatar component SHALL update its display immediately
- **AND** the component SHALL call the provided `onUpload` callback with image data
- **AND** the transition SHALL be smooth and visually appealing
- **AND** the component SHALL handle upload states appropriately