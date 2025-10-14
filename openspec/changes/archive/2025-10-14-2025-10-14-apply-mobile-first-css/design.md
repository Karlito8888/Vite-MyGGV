# Mobile-First CSS Design

## Architecture Decisions

### Breakpoint Strategy
- **Mobile**: 320px - 480px (base styles)
- **Tablet**: 481px - 768px 
- **Desktop**: 769px - 1024px
- **Large Desktop**: 1025px+

### Media Query Approach
- Use `min-width` for progressive enhancement
- Base styles target mobile (no media query)
- Enhance for larger screens with `min-width` queries

### Touch Optimization
- Minimum touch target: 48px
- Proper spacing between interactive elements
- Touch-friendly hover states
- Prevent accidental zooms (font-size: 16px on inputs)

### Performance Considerations
- Mobile-first CSS reduces file size for mobile
- Critical CSS prioritized for mobile
- Reduced complexity on mobile devices

## Implementation Patterns

### Mobile-First Structure
```css
/* Base mobile styles (320px+) */
.component {
  padding: 1rem;
  font-size: 1rem;
}

/* Tablet enhancements (481px+) */
@media (min-width: 481px) {
  .component {
    padding: 1.5rem;
    font-size: 1.125rem;
  }
}

/* Desktop enhancements (769px+) */
@media (min-width: 769px) {
  .component {
    padding: 2rem;
    font-size: 1.25rem;
  }
}
```

### Touch-Friendly Patterns
```css
.btn {
  min-height: 48px;
  padding: 1rem;
  font-size: 16px; /* Prevents iOS zoom */
}

@media (hover: none) and (pointer: coarse) {
  .btn:hover {
    transform: scale(1.02);
  }
}
```

## File Organization
- Maintain existing file structure
- Each CSS file follows mobile-first pattern
- Consistent breakpoint usage across files
- Shared mobile utilities in `index.css`