# Integrate Avatar in Header

## Change Summary
Integrate the user's avatar in the header with absolute positioning, positioned at left and 50% overlapping the main content area, with smooth JavaScript-only transitions for appearance and disappearance.

## Problem Statement
Currently, the header displays either the GGV logo (for non-authenticated users) or rotating messages (for authenticated users). There's no visual representation of the current user in the header, which reduces user identity awareness and personal connection to the application.

## Proposed Solution
Add the authenticated user's avatar to the header with:
- Absolute positioning on the left side
- 50% overlap with the main content area
- Smooth fade-in/fade-out transitions using JavaScript only
- Responsive design that works across all device sizes
- Integration with existing Avatar component

## Technical Approach
1. Modify Header.jsx to include Avatar component with absolute positioning
2. Add CSS for absolute positioning and transitions
3. Implement JavaScript-based show/hide logic with smooth transitions
4. Ensure proper z-index layering to avoid conflicts
5. Maintain existing header functionality (messages, logo)

## User Impact
- Enhanced user identity awareness in the interface
- Improved visual connection to the application
- Better personalization for authenticated users
- Maintained functionality for non-authenticated users

## Dependencies
- Existing Avatar component
- Current authentication system (useAuth hook)
- Header styling system

## Constraints
- Must use JavaScript only for transitions (no CSS animations)
- Must maintain mobile-first responsive design
- Must not interfere with existing header functionality
- Must follow project conventions (no TypeScript, no Tailwind)