## Why
Improve user experience by making the theme toggle button more accessible and visible when users scroll down the page. Currently the button stays fixed below the header area, but when users scroll down, it should move to the top of the viewport for easier access.

## What Changes
- Add scroll event listener to ThemeToggle component
- Implement dynamic positioning logic based on scroll position
- Update CSS to support smooth position transitions
- Add scroll threshold of 60px for position change

## Impact
- Affected specs: theme-system
- Affected code: ThemeToggle.jsx, ThemeToggle.css
- Enhanced user experience with better button accessibility during scrolling