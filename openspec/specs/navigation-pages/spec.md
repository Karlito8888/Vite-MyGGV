# Navigation Pages

## Purpose
Provide a comprehensive navigation system with 9 menu items including internal pages and external links, featuring horizontal scrolling with visual indicators and icon-based navigation for authenticated users.
## Requirements
### Requirement: Navigation Menu for Authenticated Users

The system SHALL provide a navigation component for authenticated users with 9 items: "Home", "Messages", "Games", "Infos", "Money", "Weather", "Marketplace", "GPS", and "Profile", which can be used independently of the footer.

#### Scenario: Navigation component extraction
- **WHEN** the navigation is extracted into a separate component
- **THEN** the Navigation component SHALL contain all navigation logic
- **AND** the Footer component SHALL import and use the Navigation component
- **AND** all navigation functionality SHALL remain identical

#### Scenario: Authenticated user sees navigation
- **WHEN** a user is authenticated and views the footer
- **THEN** they SHALL see a navigation menu with 9 items
- **AND** the navigation SHALL be hidden for non-authenticated users

#### Scenario: Navigation menu items
- **WHEN** the navigation menu is displayed
- **THEN** it SHALL contain links to: Home, Messages, Games, Infos, Money, Weather, Marketplace, GPS, Profile
- **AND** 8 items SHALL be internal React Router links
- **AND** GPS SHALL be an external link opening in new tab
- **AND** each item SHALL be clickable and navigate appropriately
- **AND** each item SHALL include appropriate icons from heroicons

### Requirement: Basic Page Components

The system SHALL provide 6 new page components with minimal content containing only an H2 element with the page name as the title.

#### Scenario: Page content structure
- **WHEN** a user navigates to any new page (/messages, /games, /infos, /money, /weather, /marketplace)
- **THEN** they SHALL see a page with minimal content
- **AND** the page SHALL contain only an H2 element with the page name as the title

#### Scenario: Page component creation
- **WHEN** creating new page components
- **THEN** each SHALL be a React functional component
- **AND** each SHALL follow the existing component structure pattern
- **AND** each SHALL be located in src/pages/ directory

### Requirement: External GPS Link

The system SHALL provide GPS as an external navigation link that opens in a new tab.

#### Scenario: GPS external navigation
- **WHEN** a user clicks on the GPS navigation item
- **THEN** it SHALL open "https://myggv-gps.netlify.app/" in a new tab
- **AND** it SHALL use target="_blank" attribute
- **AND** it SHALL not create a protected route for GPS

#### Scenario: GPS link configuration
- **WHEN** implementing the navigation menu
- **THEN** GPS SHALL be configured as an anchor tag with href
- **AND** it SHALL NOT use React Router Link component
- **AND** it SHALL include proper security attributes (rel="noopener noreferrer")

### Requirement: Protected Routes for New Pages

All new internal pages SHALL be protected routes that require authentication before access.

#### Scenario: Protected route access
- **WHEN** a non-authenticated user tries to access any new internal page
- **THEN** they SHALL be redirected to the login page
- **AND** only authenticated users SHALL be able to access these pages

#### Scenario: Route configuration
- **WHEN** configuring routes in App.jsx
- **THEN** the 6 new pages SHALL use the ProtectedRoute wrapper
- **AND** GPS SHALL NOT have a protected route (external link only)
- **AND** the routes SHALL follow the existing protected route pattern

### Requirement: Mobile-First Navigation Design

The navigation menu SHALL be responsive and usable on mobile devices following the mobile-first design principle.

#### Scenario: Mobile navigation display
- **WHEN** viewing the application on a mobile device
- **THEN** the navigation menu SHALL be responsive
- **AND** it SHALL be usable on smaller screens
- **AND** it SHALL follow mobile-first design principles

#### Scenario: Navigation responsiveness
- **WHEN** the screen size changes
- **THEN** the navigation SHALL adapt to different screen sizes
- **AND** it SHALL maintain usability across all device sizes

### Requirement: Footer Navigation Drag Scroll Enhancement

The Navigation component SHALL support drag-to-scroll functionality on desktop devices and enhanced touch scrolling on mobile devices.

#### Scenario: Desktop drag scrolling
- **WHEN** a user clicks and drags horizontally on the navigation
- **THEN** the navigation SHALL scroll smoothly following the mouse movement
- **AND** the cursor SHALL change to indicate drag state
- **AND** momentum scrolling SHALL continue after drag release

#### Scenario: Enhanced mobile touch
- **WHEN** a user swipes the navigation on mobile devices
- **THEN** enhanced touch responsiveness SHALL be provided
- **AND** smooth momentum scrolling SHALL be implemented
- **AND** natural deceleration SHALL occur after swipe end

#### Scenario: Accessibility preservation
- **WHEN** drag scrolling is implemented
- **THEN** all existing accessibility features SHALL be maintained
- **AND** keyboard navigation SHALL continue to work
- **AND** screen reader compatibility SHALL be preserved

### Requirement: Enhanced Footer Navigation Slider

The Navigation component SHALL provide modern slider functionality with smooth animations, enhanced user interactions, and a 3-column vertical grid layout for optimal vertical space utilization.

#### Scenario: Modern animations and transitions
- **WHEN** users interact with the navigation
- **THEN** smooth scroll animations SHALL be implemented
- **AND** modern transitions SHALL be provided
- **AND** 60fps performance SHALL be maintained

#### Scenario: Enhanced touch gestures
- **WHEN** users swipe on mobile devices
- **THEN** responsive vertical touch gestures SHALL be supported
- **AND** vertical swipe momentum SHALL be natural
- **AND** touch targets SHALL meet accessibility standards

#### Scenario: Visual feedback improvements
- **WHEN** navigation has scrollable content
- **THEN** modern visual indicators SHALL be displayed
- **AND** micro-interactions SHALL be implemented
- **AND** vertical scroll position SHALL be clearly indicated

#### Scenario: 3-column vertical grid layout
- **WHEN** the navigation is displayed on any screen size
- **THEN** nav-scroll-content SHALL use CSS Grid with 3 columns and vertical flow
- **AND** navigation items SHALL be distributed vertically across the grid
- **AND** the layout SHALL automatically adapt to content height
- **AND** vertical scrolling SHALL be enabled for overflow

#### Scenario: Vertical drag scrolling
- **WHEN** users click and drag vertically on the navigation
- **THEN** the navigation SHALL scroll smoothly following vertical mouse movement
- **AND** the cursor SHALL change to indicate vertical drag state
- **AND** vertical momentum scrolling SHALL continue after drag release

#### Scenario: Responsive vertical grid behavior
- **WHEN** viewing on different screen sizes
- **THEN** the vertical grid SHALL maintain 3 columns
- **AND** navigation SHALL use vertical scroll behavior
- **AND** all navigation items SHALL remain accessible
- **AND** grid SHALL adapt to available vertical space

#### Scenario: Performance and accessibility
- **WHEN** navigation animations are active
- **THEN** hardware acceleration SHALL be utilized
- **AND** reduced motion preferences SHALL be respected
- **AND** keyboard navigation SHALL be fully functional
- **AND** screen reader compatibility SHALL be preserved

