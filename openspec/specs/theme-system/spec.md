# theme-system Specification

## Purpose
TBD - created by archiving change add-theme-toggle. Update Purpose after archive.
## Requirements
### Requirement: Theme Toggle Component

The application SHALL provide a theme toggle component integrated within the footer layout with proper positioning and styling.

#### Scenario: Theme toggle renders correctly in footer
- **WHEN** user navigates to any protected route (Home, Profile)
- **THEN** a theme toggle button SHALL be visible in the footer
- **AND** the button SHALL be positioned within the footer flexbox layout
- **AND** the button SHALL display a sun icon when dark theme is active
- **AND** the button SHALL display a moon icon when light theme is active

#### Scenario: User toggles theme from footer position
- **WHEN** user clicks the theme toggle button in the footer while light theme is active
- **THEN** the application SHALL switch to dark theme
- **AND** the theme preference SHALL be saved to localStorage as 'dark'
- **AND** all UI elements SHALL update to use dark theme colors
- **AND** the toggle icon SHALL change from moon to sun
- **AND** the button SHALL maintain proper footer positioning

#### Scenario: Theme toggle styling coordination
- **WHEN** the theme toggle is rendered in the footer
- **THEN** it SHALL use CSS custom properties from index.css
- **AND** ThemeToggle.css SHALL properly integrate with theme variables
- **AND** the button SHALL maintain 48x48px minimum touch target size
- **AND** transitions SHALL be smooth and responsive

#### Scenario: Mobile-first footer theme toggle
- **WHEN** rendered on mobile devices
- **THEN** the theme toggle SHALL be easily accessible in footer
- **AND** SHALL not interfere with hamburger menu functionality
- **AND** SHALL maintain proper spacing and alignment
- **AND** SHALL be easily tappable with thumb

### Requirement: Theme Persistence

The application SHALL persist the user's theme preference across sessions using localStorage.

#### Scenario: Theme persists on page reload
- **WHEN** user selects a theme and reloads the page
- **THEN** the application SHALL load the previously selected theme from localStorage
- **AND** the correct theme SHALL be applied before the first paint (no FOUC)

#### Scenario: Default theme on first visit
- **WHEN** user visits the application for the first time
- **THEN** the application SHALL default to dark theme
- **AND** localStorage SHALL be initialized with 'dark' value

#### Scenario: localStorage unavailable fallback
- **WHEN** localStorage is unavailable (private browsing, disabled)
- **THEN** the application SHALL default to dark theme
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
  - `--color-border-button`: #e5e7eb (gray for light theme buttons)

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
  - `--color-border-button`: #50aa61 (green for dark theme buttons)

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

### Requirement: Footer Layout Integration
The theme toggle component SHALL be properly integrated within the footer flexbox layout with consistent styling alongside the hamburger button.

#### Scenario: Consistent footer button styling
- **WHEN** HamburgerButton and ThemeToggle are displayed together in footer
- **THEN** both buttons SHALL have identical size, border, background, hover, and active states
- **AND** both SHALL maintain 48x48px touch targets
- **AND** visual consistency SHALL be preserved across themes

#### Scenario: Footer flexbox layout with consistent buttons
- **WHEN** the footer renders with both buttons
- **THEN** the hamburger button SHALL maintain left positioning
- **AND** the copyright text SHALL maintain center positioning  
- **AND** the theme toggle SHALL maintain right positioning
- **AND** both buttons SHALL have identical visual styling

#### Scenario: Button interactions remain consistent
- **WHEN** user interacts with either footer button
- **THEN** hover, active, and focus states SHALL behave identically
- **AND** theme switching functionality SHALL work as expected
- **AND** menu toggle functionality SHALL work as expected

### Requirement: Conditional Button Border Colors
Footer buttons SHALL use theme-specific border colors for enhanced visual distinction.

#### Scenario: Dark mode button borders
- **WHEN** dark theme is active
- **THEN** HamburgerButton and ThemeToggle borders SHALL be green (#50aa61)
- **AND** borders SHALL provide good contrast against dark background
- **AND** hover states SHALL transition to primary color as expected

#### Scenario: Light mode button borders
- **WHEN** light theme is active
- **THEN** HamburgerButton and ThemeToggle borders SHALL be gray (#e5e7eb)
- **AND** borders SHALL provide subtle distinction in light theme
- **AND** hover states SHALL transition to primary color as expected

