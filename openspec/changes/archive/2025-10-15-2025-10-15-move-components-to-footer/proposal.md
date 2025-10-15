# Move Components to Footer

## Summary
Relocate HamburgerButton and ThemeToggle components from the header to the footer, replacing the existing logo images, and remove the old image imports.

## Why
- Better utilize footer space with functional controls
- Improve mobile UX by placing navigation and theme controls at bottom (thumb-friendly)
- Remove redundant logo images in footer
- Centralize user controls in footer area

## What Changes
- Move HamburgerButton component logic to Footer
- Move ThemeToggle component logic to Footer  
- Replace footer logo images with these components
- Remove image imports from Footer component
- Update Footer CSS to accommodate new layout
- Remove HamburgerButton import from Header component

## Technical Approach
1. Update Footer.jsx to import and render HamburgerButton and ThemeToggle
2. Modify Footer.css to style the new component layout
3. Update Header.jsx to remove HamburgerButton import and usage
4. Ensure proper state management for sidebar toggle functionality
5. Maintain responsive design principles

## Impact
- Footer becomes more functional and interactive
- Header becomes cleaner and focused on content/messages
- Navigation controls move to more accessible mobile position
- Theme toggle remains easily accessible