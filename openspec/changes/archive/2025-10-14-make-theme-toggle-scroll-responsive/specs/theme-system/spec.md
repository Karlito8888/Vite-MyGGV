## MODIFIED Requirements
### Requirement: Theme Toggle Component

The application SHALL provide a theme toggle component that adapts its position based on scroll behavior for improved accessibility.

#### Scenario: Toggle button renders in correct initial position
- **WHEN** user navigates to any protected route (Home, Profile)
- **THEN** a theme toggle button SHALL be visible
- **AND** the button SHALL be positioned at `top: calc(60px + 0.1rem)` when page is at top
- **AND** the button SHALL display a sun icon when dark theme is active
- **AND** the button SHALL display a moon icon when light theme is active

#### Scenario: Toggle button follows scroll
- **WHEN** user scrolls down more than 60px from the top of the page
- **THEN** the theme toggle button SHALL move to `top: 0.1rem`
- **AND** the position change SHALL be animated smoothly
- **AND** the button SHALL remain fixed to the viewport

#### Scenario: Toggle button returns to original position
- **WHEN** user scrolls back up to within 60px of the top of the page
- **THEN** the theme toggle button SHALL return to `top: calc(60px + 0.1rem)`
- **AND** the position change SHALL be animated smoothly
- **AND** the button SHALL maintain its right-side positioning

#### Scenario: User toggles from light to dark theme
- **WHEN** user clicks the theme toggle button while light theme is active
- **THEN** the application SHALL switch to dark theme
- **AND** the theme preference SHALL be saved to localStorage as 'dark'
- **AND** all UI elements SHALL update to use dark theme colors
- **AND** the toggle icon SHALL change from moon to sun
- **AND** the scroll-responsive positioning SHALL be maintained

#### Scenario: User toggles from dark to light theme
- **WHEN** user clicks the theme toggle button while dark theme is active
- **THEN** the application SHALL switch to light theme
- **AND** the theme preference SHALL be saved to localStorage as 'light'
- **AND** all UI elements SHALL update to use light theme colors
- **AND** the toggle icon SHALL change from sun to moon
- **AND** the scroll-responsive positioning SHALL be maintained

## ADDED Requirements
### Requirement: Scroll-Responsive Positioning

The theme toggle button SHALL dynamically adjust its position based on scroll position to maintain accessibility.

#### Scenario: Scroll position detection
- **WHEN** the user scrolls the page
- **THEN** the component SHALL monitor scroll position in real-time
- **AND** the component SHALL use a 60px threshold for position changes
- **AND** the scroll detection SHALL be performant with proper event handling

#### Scenario: Smooth position transitions
- **WHEN** the button position changes due to scrolling
- **THEN** the transition SHALL be smooth and visually appealing
- **AND** the transition duration SHALL be approximately 200ms
- **AND** the transition SHALL not interfere with user interactions

#### Scenario: Performance optimization
- **WHEN** implementing scroll event listeners
- **THEN** the component SHALL use proper event listener cleanup on unmount
- **AND** the scroll handling SHALL be optimized to prevent performance issues
- **AND** the component SHALL handle rapid scrolling gracefully

#### Scenario: Responsive positioning across devices
- **WHEN** viewed on different screen sizes
- **THEN** the scroll-responsive behavior SHALL work consistently
- **AND** the 60px threshold SHALL be appropriate for mobile and desktop
- **AND** the button SHALL remain accessible on all device types