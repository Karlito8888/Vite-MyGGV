# avatar-component Specification

## Purpose
TBD - created by archiving change 2025-10-15-add-avatar-component. Update Purpose after archive.
## Requirements
### Requirement: Avatar Component Creation
A reusable Avatar component MUST be created to display user profile images consistently across the application.

#### Scenario:
- WHEN implementing user interfaces that need to display user profile images
- THEN the component SHALL accept `src`, `alt`, `size`, `fallback`, and `className` props
- AND the component SHALL support three size variants: small (32px), medium (64px), large (96px)
- AND the component SHALL display fallback text when no image is provided
- AND the component SHALL handle broken image URLs gracefully
- AND the component SHALL follow mobile-first responsive design principles

### Requirement: Avatar Component Styling
Avatar components SHALL have consistent visual styling across the application.

#### Scenario:
- WHEN viewing avatars throughout the application
- THEN the avatar SHALL have circular design with consistent border radius
- AND the avatar SHALL maintain proper aspect ratio
- AND the avatar SHALL include smooth transitions and hover effects
- AND the avatar SHALL use consistent color scheme for fallback states
- AND the avatar SHALL be optimized for mobile touch targets

### Requirement: Profile Page Integration
The Profile page SHALL be updated to use the new Avatar component.

#### Scenario:
- WHEN users navigate to their profile page
- THEN the implementation SHALL replace existing inline avatar logic in Profile.jsx:185-192
- AND the profile avatar SHALL use medium size for display
- AND the component SHALL show user initial as fallback when no avatar URL
- AND the integration SHALL maintain existing profile section structure
- AND the change SHALL preserve all current functionality

### Requirement: Avatar Component Reusability
The Avatar component SHALL be easily reusable across different parts of the application.

#### Scenario:
- WHEN adding new features that require user avatars (headers, comments, user lists)
- THEN the component SHALL support simple import: `import Avatar from '../components/Avatar'`
- AND the component SHALL provide flexible prop interface for different use cases
- AND the component SHALL support optional className prop for custom styling
- AND the component SHALL have clear documentation through prop naming
- AND the component SHALL not require external dependencies

### Requirement: Error Handling and Accessibility
The Avatar component SHALL handle errors gracefully and maintain accessibility standards.

#### Scenario:
- WHEN images fail to load or users have accessibility needs
- THEN the component SHALL provide proper alt text for screen readers
- AND the component SHALL handle graceful fallback for broken images
- AND the component SHALL include loading state handling
- AND the component SHALL use semantic HTML structure
- AND the component SHALL support keyboard navigation

### Requirement: Online Status Indicator
The Avatar component SHALL display a visual indicator when the user is online.

#### Scenario: Green border for online status
- **WHEN** the user's presence state is "online"
- **THEN** the Avatar component SHALL display a green border
- **AND** the green border SHALL be visually distinct from the default border
- **AND** the indicator SHALL be responsive across all device sizes

#### Scenario: Default border for offline status
- **WHEN** the user's presence state is "offline" or unknown
- **THEN** the Avatar component SHALL display the default border color
- **AND** the component SHALL maintain existing styling behavior

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

