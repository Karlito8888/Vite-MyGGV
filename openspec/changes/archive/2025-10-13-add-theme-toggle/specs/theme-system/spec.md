## ADDED Requirements

### Requirement: Theme Toggle Component

The application SHALL provide a theme toggle component that allows users to switch between light and dark themes.

#### Scenario: Toggle button renders in correct position
- **WHEN** user navigates to any protected route (Home, Profile)
- **THEN** a theme toggle button SHALL be visible
- **AND** the button SHALL be positioned absolutely in the top-right corner of the main content area
- **AND** the button SHALL display a sun icon when dark theme is active
- **AND** the button SHALL display a moon icon when light theme is active

#### Scenario: User toggles from light to dark theme
- **WHEN** user clicks the theme toggle button while light theme is active
- **THEN** the application SHALL switch to dark theme
- **AND** the theme preference SHALL be saved to localStorage as 'dark'
- **AND** all UI elements SHALL update to use dark theme colors
- **AND** the toggle icon SHALL change from moon to sun

#### Scenario: User toggles from dark to light theme
- **WHEN** user clicks the theme toggle button while dark theme is active
- **THEN** the application SHALL switch to light theme
- **AND** the theme preference SHALL be saved to localStorage as 'light'
- **AND** all UI elements SHALL update to use light theme colors
- **AND** the toggle icon SHALL change from sun to moon

### Requirement: Theme Persistence

The application SHALL persist the user's theme preference across sessions using localStorage.

#### Scenario: Theme persists on page reload
- **WHEN** user selects a theme and reloads the page
- **THEN** the application SHALL load the previously selected theme from localStorage
- **AND** the correct theme SHALL be applied before the first paint (no FOUC)

#### Scenario: Default theme on first visit
- **WHEN** user visits the application for the first time
- **THEN** the application SHALL default to light theme
- **AND** localStorage SHALL be initialized with 'light' value

#### Scenario: localStorage unavailable fallback
- **WHEN** localStorage is unavailable (private browsing, disabled)
- **THEN** the application SHALL default to light theme
- **AND** theme changes SHALL still work within the current session
- **AND** no errors SHALL be thrown

### Requirement: CSS Custom Properties for Theming

The application SHALL use CSS custom properties (variables) for all theme-dependent colors.

#### Scenario: Light theme color variables defined
- **WHEN** light theme is active
- **THEN** CSS custom properties SHALL be set with light theme values:
  - `--color-primary`: #50aa61 (brand green)
  - `--color-secondary`: #f3c549 (brand yellow)
  - `--color-background`: #ffffff
  - `--color-surface`: #f5f5f5
  - `--color-text-primary`: #1a1a1a
  - `--color-text-secondary`: #4b5563
  - `--color-border`: #e5e7eb

#### Scenario: Dark theme color variables defined
- **WHEN** dark theme is active
- **THEN** CSS custom properties SHALL be set with dark theme values:
  - `--color-primary`: #5bc46d (lighter green for contrast)
  - `--color-secondary`: #f5d165 (lighter yellow for contrast)
  - `--color-background`: #1a1a1a
  - `--color-surface`: #2d2d2d
  - `--color-text-primary`: #f5f5f5
  - `--color-text-secondary`: #9ca3af
  - `--color-border`: #404040

#### Scenario: All CSS files use theme variables
- **WHEN** any CSS file defines colors
- **THEN** it SHALL use CSS custom properties via `var()` function
- **AND** hardcoded color values SHALL be replaced with semantic variable references
- **AND** fallback values SHALL be provided for browser compatibility

### Requirement: FOUC Prevention

The application SHALL prevent Flash of Unstyled Content (FOUC) when loading with a saved theme preference.

#### Scenario: Theme applied before first paint
- **WHEN** user loads the application with a saved theme preference
- **THEN** an inline script in index.html SHALL execute before any CSS loads
- **AND** the script SHALL read theme from localStorage
- **AND** the script SHALL add the theme class to document.documentElement
- **AND** the first paint SHALL render with the correct theme colors
- **AND** no flash of incorrect theme SHALL be visible

### Requirement: PWA Theme Color Integration

The PWA manifest and meta theme-color SHALL update dynamically based on the active theme.

#### Scenario: Light theme PWA color
- **WHEN** light theme is active
- **THEN** the meta theme-color tag SHALL be set to #ffffff
- **AND** the PWA manifest theme_color SHALL be #ffffff
- **AND** the mobile browser address bar SHALL display white color

#### Scenario: Dark theme PWA color
- **WHEN** dark theme is active
- **THEN** the meta theme-color tag SHALL be set to #1a1a1a
- **AND** the PWA manifest theme_color SHALL be #1a1a1a
- **AND** the mobile browser address bar SHALL display dark color

### Requirement: Accessibility Compliance

All theme color combinations SHALL meet WCAG AA accessibility standards for color contrast.

#### Scenario: Light theme contrast ratios
- **WHEN** light theme is active
- **THEN** text on background SHALL have minimum 4.5:1 contrast ratio
- **AND** interactive elements SHALL have minimum 3:1 contrast ratio
- **AND** all content SHALL be readable

#### Scenario: Dark theme contrast ratios
- **WHEN** dark theme is active
- **THEN** text on background SHALL have minimum 4.5:1 contrast ratio
- **AND** interactive elements SHALL have minimum 3:1 contrast ratio
- **AND** all content SHALL be readable

### Requirement: Mobile-First Theme Toggle

The theme toggle button SHALL be optimized for mobile touch interactions.

#### Scenario: Touch-friendly button size
- **WHEN** rendered on mobile devices
- **THEN** the toggle button SHALL have minimum 48x48px touch target
- **AND** the button SHALL be easily tappable with thumb
- **AND** the button SHALL not overlap with other interactive elements

#### Scenario: Smooth theme transition
- **WHEN** user toggles theme
- **THEN** color changes SHALL transition smoothly over 200ms
- **AND** the transition SHALL not cause layout shift
- **AND** the transition SHALL feel responsive and immediate
