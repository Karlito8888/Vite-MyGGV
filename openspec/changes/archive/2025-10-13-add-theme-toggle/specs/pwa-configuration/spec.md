## ADDED Requirements

### Requirement: Dynamic Theme Color Support

The PWA manifest SHALL support dynamic theme colors that change based on the active theme (light or dark).

#### Scenario: Manifest includes both light and dark theme colors
- **WHEN** the PWA manifest is generated
- **THEN** it SHALL include a theme_color property
- **AND** the theme_color SHALL be set to #ffffff for light theme
- **AND** the theme_color SHALL be set to #1a1a1a for dark theme
- **AND** the manifest SHALL update when theme changes

#### Scenario: Meta theme-color tag updates dynamically
- **WHEN** user switches between light and dark themes
- **THEN** the meta theme-color tag in index.html SHALL update
- **AND** the mobile browser address bar SHALL reflect the new theme color
- **AND** the color change SHALL occur immediately without page reload
