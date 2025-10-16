## MODIFIED Requirements
### Requirement: Basic Square Image Cropper
A basic square image cropper component SHALL be created for avatar upload functionality using shadcn's image crop component.

#### Scenario: Image cropping interface
- **WHEN** a user selects an image for avatar upload
- **THEN** the cropper SHALL display the image in a square aspect ratio using shadcn's ReactCrop component
- **AND** the user SHALL be able to drag and resize the crop area with improved touch support
- **AND** the cropper SHALL provide enhanced crop controls (zoom, position) with better UX
- **AND** the cropper SHALL generate a square cropped image output as base64 string
- **AND** the component SHALL maintain the existing callback interface (onCrop, onCancel)

#### Scenario: Enhanced cropper integration
- **WHEN** the shadcn-based cropper is integrated with the Avatar component
- **THEN** it SHALL accept image files as input with consistent API
- **AND** it SHALL return cropped image data as base64 string for compatibility
- **AND** it SHALL maintain reasonable file size for avatar storage with automatic compression
- **AND** it SHALL provide cancel and confirm actions with improved visual feedback
- **AND** the component SHALL include built-in loading states and error handling

#### Scenario: Dependency and styling updates
- **WHEN** implementing the shadcn image crop component
- **THEN** the system SHALL add required dependencies (react-image-crop, radix-ui)
- **AND** the component SHALL use shadcn's styling system adapted to project's CSS approach
- **AND** the custom ImageCropper.css SHALL be removed in favor of component-based styling
- **AND** the implementation SHALL maintain mobile-first responsive design
- **AND** the component SHALL preserve accessibility standards with improved ARIA support