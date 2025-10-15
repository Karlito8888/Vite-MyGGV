# Theme System Scroll Logic Removal

## REMOVED Requirements

### Requirement: Scroll-Responsive Positioning

The theme toggle button SHALL NOT dynamically adjust its position based on scroll position.

#### Scenario: Toggle button follows scroll
- **WHEN** user scrolls down more than 60px from the top of the page
- **THEN** this behavior SHALL be removed
- **AND** the button SHALL NOT move to `top: 0.1rem` based on scroll
- **AND** no scroll-based positioning SHALL occur

#### Scenario: Toggle button returns to original position
- **WHEN** user scrolls back up to within 60px of the top of the page
- **THEN** this behavior SHALL be removed
- **AND** the button SHALL NOT return to `top: calc(60px + 0.1rem)` based on scroll
- **AND** no scroll-based positioning SHALL occur

## MODIFIED Requirements

### Requirement: Theme Toggle Component

The application SHALL provide a theme toggle component with simplified fixed positioning.

#### Scenario: Toggle button renders in correct initial position
- **WHEN** user navigates to any protected route (Home, Profile)
- **THEN** a theme toggle button SHALL be visible
- **AND** the button SHALL be positioned at `top: 0.1rem` consistently
- **AND** the button SHALL display a sun icon when dark theme is active
- **AND** the button SHALL display a moon icon when light theme is active

#### Scenario: User toggles from light to dark theme
- **WHEN** user clicks the theme toggle button while light theme is active
- **THEN** the application SHALL switch to dark theme
- **AND** the theme preference SHALL be saved to localStorage as 'dark'
- **AND** all UI elements SHALL update to use dark theme colors
- **AND** the toggle icon SHALL change from moon to sun
- **AND** the button SHALL maintain fixed positioning

#### Scenario: User toggles from dark to light theme
- **WHEN** user clicks the theme toggle button while dark theme is active
- **THEN** the application SHALL switch to light theme
- **AND** the theme preference SHALL be saved to localStorage as 'light'
- **AND** all UI elements SHALL update to use light theme colors
- **AND** the toggle icon SHALL change from sun to moon
- **AND** the button SHALL maintain fixed positioning