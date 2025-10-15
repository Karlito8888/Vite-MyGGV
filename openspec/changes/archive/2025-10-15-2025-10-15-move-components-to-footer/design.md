# Design: Move Components to Footer

## Architecture Considerations

### Component Reorganization
- **Footer**: Becomes the primary location for user controls (navigation, theme)
- **Header**: Simplified to focus on branding and message display
- **Layout**: Maintains fixed header/footer pattern with redistributed functionality

### State Management
- HamburgerButton requires `onToggle` and `isSidebarOpen` props from Layout
- ThemeToggle remains self-contained with localStorage state
- Footer needs to receive sidebar state props from Layout component

### Responsive Design
- Footer height may need adjustment to accommodate new components
- Component spacing and alignment for mobile-first approach
- Ensure touch targets meet accessibility standards (44px minimum)

### CSS Strategy
- Remove `.footer-logo` styles
- Add styles for component container in footer
- Maintain existing footer responsive breakpoints
- Ensure proper flexbox layout for component alignment

## Implementation Flow
1. Update Footer component structure and imports
2. Modify Footer CSS for new layout
3. Update Layout to pass props to Footer instead of Header
4. Clean up Header component
5. Test responsive behavior and functionality