## MODIFIED Requirements

### Requirement: Theme Persistence

The application SHALL persist the user's theme preference across sessions using localStorage.

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

## ADDED Requirements

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

#### Scenario: Border color transitions
- **WHEN** user toggles between themes
- **THEN** border colors SHALL transition smoothly with existing 0.3s ease transition
- **AND** no visual artifacts SHALL appear during transition
- **AND** border color changes SHALL be synchronized with other theme changes