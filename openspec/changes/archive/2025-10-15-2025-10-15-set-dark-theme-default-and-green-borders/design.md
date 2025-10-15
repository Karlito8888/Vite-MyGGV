# Design Decisions

## Overview
This change modifies the default theme behavior and adds conditional border colors to enhance visual distinction between themes while maintaining existing functionality.

## Key Design Decisions

### 1. Dark Theme as Default
**Decision**: Change default theme from light to dark for new users
**Rationale**: 
- Dark mode is preferred by many users, especially on mobile devices
- Better for battery life on OLED screens
- Reduced eye strain in low-light conditions
- Modern apps increasingly default to dark themes

**Implementation Approach**:
- Update inline script in index.html to default to 'dark'
- Update ThemeToggle.jsx useState initialization
- Maintain backward compatibility for existing users

### 2. Conditional Border Colors
**Decision**: Use green borders in dark mode, gray borders in light mode
**Rationale**:
- Green (#50aa61) is the brand primary color and provides good contrast in dark mode
- Gray (#e5e7eb) provides subtle distinction in light mode without being harsh
- Enhanced visual feedback for theme state
- Maintains accessibility standards

**Implementation Approach**:
- Add new CSS custom property --color-border-button
- Use theme-specific values in CSS custom properties definition
- Apply to both HamburgerButton and ThemeToggle for consistency

### 3. CSS Custom Properties Strategy
**Decision**: Create separate --color-border-button variable instead of modifying --color-border
**Rationale**:
- Prevents unintended side effects on other components using --color-border
- Provides specific control over button border styling
- Maintains existing theming architecture
- Allows for future customization of button borders independently

### 4. FOUC Prevention Maintenance
**Decision**: Ensure FOUC prevention works with new dark default
**Rationale**:
- Critical for user experience
- Existing implementation is robust
- Only default value needs to change
- Maintains performance characteristics

## Technical Considerations

### Theme Initialization Flow
1. Inline script executes before CSS loads
2. Checks localStorage for saved theme
3. Defaults to 'dark' if no saved theme
4. Applies appropriate class and meta theme-color
5. React components initialize with consistent theme

### Border Color Implementation
- Uses CSS cascade with theme-specific selectors
- Leverages existing CSS custom properties system
- Maintains transition animations
- Preserves accessibility contrast ratios

### Backward Compatibility
- Existing localStorage values take precedence
- No breaking changes to API
- Component interfaces remain unchanged
- Theme switching behavior preserved

## Trade-offs

### Pros
- Better default user experience for dark mode preference
- Enhanced visual distinction between themes
- Maintains all existing functionality
- Minimal implementation complexity

### Cons
- Users who prefer light mode must toggle on first visit
- Slight increase in CSS complexity
- Need to update documentation

## Future Considerations
- Could add user preference detection (OS-level dark mode)
- Potential for more granular theme customization
- Opportunity to expand conditional styling to other components