# Consolidate Footer CSS Styles

## Summary
Move all CSS styles from `HamburgerButton.css` and `ThemeToggle.css` into `Footer.css` to consolidate footer-related styles, then remove the redundant CSS files.

## Why
The current CSS organization creates unnecessary complexity with footer-related styles scattered across three separate files. This separation increases maintenance overhead, makes debugging more difficult, and violates the project's principle of keeping things simple. Consolidating these styles into a single `Footer.css` file will improve code organization while maintaining all existing functionality.

## Problem
Currently, footer component styles are scattered across multiple CSS files:
- `Footer.css` contains base footer styles and some component overrides
- `HamburgerButton.css` contains hamburger button styles used in footer
- `ThemeToggle.css` contains theme toggle button styles used in footer

This creates unnecessary file separation and makes maintenance more complex.

## Solution
1. Consolidate all hamburger button and theme toggle styles into `Footer.css`
2. Ensure proper organization and avoid style conflicts
3. Remove `HamburgerButton.css` and `ThemeToggle.css` files
4. Update any imports in components

## What Changes
- Consolidate all CSS from `HamburgerButton.css` and `ThemeToggle.css` into `Footer.css`
- Remove redundant CSS files
- Update component imports to reference consolidated CSS
- Maintain all existing functionality and styling

## Impact
- Reduced file count and complexity
- Centralized footer-related styling
- Easier maintenance and debugging
- No functional changes to the UI

## Scope
- Files modified: `Footer.css`, component imports
- Files removed: `HamburgerButton.css`, `ThemeToggle.css`
- No breaking changes to functionality