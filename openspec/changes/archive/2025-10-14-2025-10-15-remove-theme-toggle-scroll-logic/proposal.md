# Remove Theme Toggle Scroll Logic

## Summary
Remove all scroll-related logic from the ThemeToggle component to simplify the component and eliminate unnecessary scroll event listeners.

## Why
The scroll-based positioning logic adds unnecessary complexity to the ThemeToggle component. The scroll event listener creates performance overhead and the dynamic positioning provides minimal user value. Removing this logic aligns with the project's "keep it simple" principle and reduces the component's cognitive load while maintaining full theme switching functionality.

## What Changes
- Remove `isScrolled` state variable and scroll-related useEffect hook from ThemeToggle.jsx
- Remove `scrolled` class from button className
- Remove `.theme-toggle.scrolled` CSS rule from ThemeToggle.css
- Update `.theme-toggle` positioning to use fixed `top: 0.1rem`
- Remove unused `useEffect` import from ThemeToggle.jsx

## Current Behavior
The ThemeToggle component currently:
- Tracks scroll position with `isScrolled` state
- Adds scroll event listener to window
- Applies `scrolled` class when scrollY > 60
- Changes position from `top: calc(60px + 0.1rem)` to `top: 0.1rem` when scrolled

## Proposed Change
Remove all scroll-related functionality:
- Remove `isScrolled` state
- Remove scroll event listener and related useEffect
- Remove `scrolled` class from button element
- Update CSS to use fixed positioning without scroll-based changes

## Benefits
- Simplified component with fewer state variables
- Eliminated scroll event listener (performance improvement)
- Cleaner, more maintainable code
- Consistent positioning regardless of scroll state

## Impact
- Theme toggle will maintain fixed position at all times
- CSS `.scrolled` class and related styles will become unused
- No functional impact on theme switching capability