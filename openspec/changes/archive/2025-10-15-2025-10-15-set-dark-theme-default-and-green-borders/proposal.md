# Set Dark Theme Default and Green Borders

## Why
Improve user experience by defaulting to dark theme (preferred by many users, especially on mobile) and enhance visual distinction between themes with conditional border colors for better feedback and accessibility.

## What Changes
- Update default theme from light to dark for new users
- Add conditional border colors: green in dark mode, gray in light mode for HamburgerButton and ThemeToggle
- Add new CSS custom property `--color-border-button` for theme-specific button borders
- Update theme initialization script and component defaults
- Maintain backward compatibility for existing users

## Summary
Change the default theme from light to dark mode and add conditional border colors for HamburgerButton and ThemeToggle components - green borders in dark mode, gray borders in light mode.

## Problem Statement
Currently, the application defaults to light theme on first visit, but users may prefer dark mode as the default experience. Additionally, the border colors for theme toggle and hamburger buttons are the same across both themes, missing an opportunity for better visual distinction.

## Proposed Solution
1. Update the default theme initialization to use 'dark' instead of 'light'
2. Add theme-specific border colors for HamburgerButton and ThemeToggle components
3. Maintain existing functionality while improving visual feedback

## Scope
- Modify theme initialization logic in index.html and ThemeToggle.jsx
- Update CSS for HamburgerButton.css and ThemeToggle.css to include conditional border colors
- Ensure FOUC prevention still works with new default

## Impact Analysis
- **User Experience**: Users will see dark theme on first visit, potentially better for mobile/low-light usage
- **Visual Design**: Enhanced visual distinction between themes through border color changes
- **Backward Compatibility**: Existing users' saved preferences will be respected

## Dependencies
- Existing theme system infrastructure
- CSS custom properties for theming
- localStorage for theme persistence

## Success Criteria
- New users see dark theme on first visit
- Border colors are green in dark mode, gray in light mode for both components
- No FOUC occurs on page load
- Existing theme toggle functionality remains intact