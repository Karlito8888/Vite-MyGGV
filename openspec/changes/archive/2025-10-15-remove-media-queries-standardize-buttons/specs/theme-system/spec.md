## MODIFIED Requirements
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