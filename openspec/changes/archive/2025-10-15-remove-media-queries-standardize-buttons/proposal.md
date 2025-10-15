## Why
Remove responsive complexity from header/footer components and create consistent button styling for better maintainability and simpler mobile-first design.

## What Changes
- Remove all media queries from Footer.css, Header.css, HamburgerButton.css, and ThemeToggle.css
- Standardize HamburgerButton and ThemeToggle to use identical styling properties
- Maintain mobile-first approach with fixed base styles

## Impact
- Affected specs: responsive-design, theme-system
- Affected code: src/components/Footer.jsx, src/components/Header.jsx, src/components/HamburgerButton.jsx, src/components/ThemeToggle.jsx and their CSS files
- Simplified responsive behavior across header/footer components