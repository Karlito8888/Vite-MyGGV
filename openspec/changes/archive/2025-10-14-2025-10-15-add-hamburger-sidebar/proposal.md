# Add Hamburger Button and Collapsible Sidebar

## Summary
Create a hamburger button in the header that toggles a collapsible sidebar containing the Navigation component. The sidebar will slide in from the left side of the screen and be hidden by default.

## User Story
As a mobile user, I want a hamburger menu that reveals navigation options in a sidebar so that I can access all pages without taking up screen space when not needed.

## Why
The current navigation is always visible and takes up screen space, which is problematic on mobile devices where screen real estate is limited. A hamburger menu with collapsible sidebar provides a better mobile experience by:
- Saving screen space when navigation is not needed
- Providing a familiar mobile navigation pattern
- Maintaining all existing navigation functionality
- Improving accessibility with proper focus management
- Supporting touch-friendly interactions

## What Changes
- Add hamburger button to Header component with toggle functionality
- Create new Sidebar component with slide-in animation from left
- Integrate existing Navigation component into sidebar
- Add backdrop overlay for focus management
- Implement multiple close methods (X button, overlay click, Escape key)
- Add body scroll lock when sidebar is open
- Harmonize styles with existing design system
- Ensure mobile-first responsive design
- Maintain accessibility standards

## Scope
- Add hamburger button to Header component
- Create collapsible sidebar component
- Integrate existing Navigation component into sidebar
- Implement slide-in animation from left
- Add overlay backdrop when sidebar is open
- Close sidebar when clicking outside or on backdrop

## Technical Approach
- Use React state for sidebar visibility
- CSS transitions for smooth slide animation
- Click handlers for toggle and close functionality
- Responsive design considerations
- Maintain existing Navigation component functionality

## Files to Modify
- `src/components/Header.jsx` - Add hamburger button
- `src/components/Layout.jsx` - Add sidebar integration
- `src/styles/Header.css` - Hamburger button styles
- `src/styles/index.css` - Sidebar and overlay styles

## Files to Create
- `src/components/Sidebar.jsx` - New sidebar component
- `src/styles/Sidebar.css` - Sidebar-specific styles

## Constraints
- No TypeScript
- No Tailwind CSS
- Keep it simple and mobile-first
- Preserve existing Navigation functionality
- Follow project conventions