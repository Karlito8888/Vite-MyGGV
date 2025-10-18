# Integrate react-mobile-picker for Block and Lot Selection

## Why
The current onboarding flow uses standard HTML `<select>` elements for block and lot selection, which provide a poor user experience on mobile devices. Native dropdowns are difficult to use with touch interfaces, especially when dealing with potentially long lists of options. This leads to user frustration and higher abandonment rates during the critical onboarding process. Modern mobile users expect smooth, touch-friendly picker interfaces similar to native iOS/Android experiences.

## Summary
Replace the standard HTML select dropdowns for block and lot selection in the Onboarding component with the elegant and modern react-mobile-picker component to improve user experience on mobile devices.

## Problem Statement
The current onboarding flow uses standard HTML `<select>` elements for block and lot selection, which provide a poor user experience on mobile devices. Native dropdowns are difficult to use, especially when dealing with potentially long lists of options, and don't provide the modern, touch-friendly interface expected in mobile applications.

## Proposed Solution
Integrate the react-mobile-picker npm package to replace the existing select dropdowns with a mobile-optimized picker interface. This will provide:
- Native mobile picker experience similar to iOS/Android pickers
- Smooth scrolling and touch-friendly interaction
- Better visual feedback and modern UI
- Improved accessibility for mobile users

## Scope
- Replace block and lot selection dropdowns in Onboarding.jsx
- Add react-mobile-picker dependency to package.json
- Maintain existing form validation and data flow
- Ensure compatibility with react-hook-form integration
- Preserve responsive design for desktop users

## Benefits
- Enhanced mobile user experience
- Modern, professional interface
- Improved accessibility and usability
- Better touch interaction patterns
- Consistent with mobile app conventions

## Technical Considerations
- Need to integrate with existing react-hook-form Controller pattern
- Must maintain form validation and error handling
- Should gracefully handle loading states for blocks/lots
- Need to ensure proper styling integration with existing CSS
- Must preserve existing data flow and submission logic

## Dependencies
- react-mobile-picker npm package
- Potential CSS adjustments for picker integration
- Form controller updates to handle picker value changes