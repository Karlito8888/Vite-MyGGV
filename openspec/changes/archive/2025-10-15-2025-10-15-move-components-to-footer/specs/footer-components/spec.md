# Footer Components Specification

## ADDED Requirements

### Requirement: Footer must render HamburgerButton and ThemeToggle components
The system SHALL display hamburger menu button and theme toggle button in footer instead of logo images.

#### Scenario: Component display
- **WHEN** user views any page with footer
- **THEN** footer should display the hamburger menu button and theme toggle button instead of logo images

#### Scenario: Hamburger functionality
- **WHEN** user clicks hamburger button in footer
- **THEN** sidebar should toggle open/closed

#### Scenario: Theme toggle functionality
- **WHEN** user clicks theme toggle in footer
- **THEN** application theme should switch between light and dark modes

### Requirement: Footer must receive sidebar state props
The system SHALL pass sidebar state props from Layout to Footer component.

#### Scenario: Props passing
- **WHEN** Layout component renders Footer
- **THEN** it must pass `onToggle` and `isSidebarOpen` props to Footer

#### Scenario: State reflection
- **WHEN** sidebar state changes
- **THEN** Footer's HamburgerButton should reflect current state visually

### Requirement: Footer layout must accommodate new components
The system SHALL provide proper layout for components in footer.

#### Scenario: Component spacing
- **WHEN** footer renders components
- **THEN** they should be properly spaced and aligned

#### Scenario: Mobile accessibility
- **WHEN** on mobile devices
- **THEN** components should be easily accessible with thumb interaction

#### Scenario: Touch targets
- **WHEN** components are rendered
- **THEN** they should maintain proper touch target sizes (minimum 44px)

## MODIFIED Requirements

### Requirement: Footer component structure
The system SHALL update Footer component to use new components instead of logos.

#### Scenario: Component imports
- **WHEN** Footer component is updated
- **THEN** it should import HamburgerButton and ThemeToggle components

#### Scenario: Logo removal
- **WHEN** Footer component is updated
- **THEN** it should remove ggvLogo import and logo img elements

#### Scenario: Component rendering
- **WHEN** Footer renders
- **THEN** it should render components in place of the two logo images

### Requirement: Footer CSS styling
The system SHALL update Footer CSS for new component layout.

#### Scenario: Logo style removal
- **WHEN** Footer CSS is updated
- **THEN** it should remove `.footer-logo` styles

#### Scenario: Component styling
- **WHEN** Footer CSS is updated
- **THEN** it should add styles for component container and button spacing

#### Scenario: Responsive maintenance
- **WHEN** Footer CSS is updated
- **THEN** it should maintain responsive height and layout behavior

## REMOVED Requirements

### Requirement: Footer logo display
The system SHALL remove logo display from footer.

#### Scenario: Logo image removal
- **WHEN** Footer is updated
- **THEN** it should no longer display duplicate GGV logo images

#### Scenario: Import cleanup
- **WHEN** Footer is updated
- **THEN** it should remove ggvLogo import statement