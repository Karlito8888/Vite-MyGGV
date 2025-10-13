## Context

The application currently has no theme switching capability. Users viewing the app in different lighting conditions (bright daylight vs. dark environments) would benefit from theme options. This change implements a light/dark theme system inspired by Z.ai's approach but simplified for this non-professional PWA project.

**Constraints:**
- NO TypeScript - React with JSX only
- NO Tailwind CSS - standard CSS only
- Must work as PWA on mobile devices
- Simple, non-over-engineered solution
- Brand colors: #50aa61 (green) and #f3c549 (yellow)

## Goals / Non-Goals

**Goals:**
- Implement light/dark theme toggle with localStorage persistence
- Prevent FOUC (Flash of Unstyled Content) on page load
- Position toggle button absolutely in top-right of main content
- Create cohesive color palette using brand colors
- Update PWA manifest theme-color dynamically
- Maintain accessibility (WCAG AA contrast ratios)

**Non-Goals:**
- System theme detection (no "auto" mode - only manual light/dark)
- Per-page theme preferences
- Animated theme transitions beyond basic fade
- Theme customization beyond light/dark presets
- Supabase storage of theme preference (localStorage only)

## Decisions

### Decision 1: CSS Custom Properties (CSS Variables)
**What:** Use CSS custom properties for all theme-dependent colors
**Why:** 
- Native CSS solution, no dependencies
- Easy to maintain and update
- Better performance than class-based switching
- Works seamlessly with existing CSS files

**Alternatives considered:**
- Class-based theming (`.light .button`, `.dark .button`) - More verbose, harder to maintain
- CSS-in-JS - Violates project constraint of standard CSS only

### Decision 2: Inline Script in index.html
**What:** Add `<script>` in `<head>` before body to initialize theme
**Why:**
- Prevents FOUC by applying theme class before first paint
- Reads localStorage synchronously before render
- Inspired by Z.ai's proven approach

**Implementation:**
```javascript
const initTheme = () => {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.add(theme);
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'light' ? '#ffffff' : '#1a1a1a');
};
initTheme();
```

### Decision 3: Color Palette Design
**What:** Create semantic color variables based on brand colors

**Light Theme:**
- Primary: #50aa61 (brand green)
- Secondary: #f3c549 (brand yellow)
- Background: #ffffff
- Surface: #f5f5f5
- Text Primary: #1a1a1a
- Text Secondary: #4b5563
- Border: #e5e7eb

**Dark Theme:**
- Primary: #5bc46d (lighter green for contrast)
- Secondary: #f5d165 (lighter yellow for contrast)
- Background: #1a1a1a
- Surface: #2d2d2d
- Text Primary: #f5f5f5
- Text Secondary: #9ca3af
- Border: #404040

**Why:** 
- Maintains brand identity with green/yellow
- Ensures WCAG AA contrast ratios
- Neutral backgrounds prevent eye strain
- Semantic naming makes maintenance easier

### Decision 4: Toggle Button Position
**What:** Absolute positioning in top-right of main content area
**Why:**
- Accessible on all pages without header modification
- Doesn't interfere with existing navigation
- Mobile-friendly (easy thumb reach on right side)
- Consistent position across all routes

**CSS:**
```css
.theme-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 50;
}
```

### Decision 5: Icon-Only Toggle (Sun/Moon)
**What:** Use SVG icons (sun for light, moon for dark) without text label
**Why:**
- Universal symbols, language-independent
- Compact, doesn't clutter UI
- Works well on mobile screens
- Follows common UX patterns

## Risks / Trade-offs

**Risk 1: FOUC on slow connections**
- **Mitigation:** Inline script executes before any CSS loads, minimizing risk
- **Trade-off:** Slightly larger HTML file size (negligible ~500 bytes)

**Risk 2: localStorage not available (private browsing)**
- **Mitigation:** Fallback to 'light' theme if localStorage fails
- **Trade-off:** Theme won't persist in private browsing mode (acceptable)

**Risk 3: Color contrast issues in dark mode**
- **Mitigation:** Test all color combinations with WCAG contrast checker
- **Mitigation:** Use lighter shades of brand colors in dark mode
- **Trade-off:** Dark mode colors slightly different from brand colors

**Risk 4: CSS variable browser support**
- **Mitigation:** CSS variables supported in all modern browsers (95%+ coverage)
- **Trade-off:** Won't work in IE11 (acceptable for PWA targeting mobile)

## Migration Plan

**Phase 1: Foundation (No Breaking Changes)**
1. Add CSS custom properties to `index.css`
2. Add theme initialization script to `index.html`
3. Create ThemeToggle component (not yet integrated)

**Phase 2: CSS Migration (Gradual)**
4. Update one CSS file at a time to use variables
5. Test each page after migration
6. Verify both themes render correctly

**Phase 3: Integration**
7. Add ThemeToggle to Layout component
8. Update PWA manifest with theme colors
9. Final testing across all pages and devices

**Rollback:**
- If issues arise, remove ThemeToggle from Layout
- CSS variables with fallback values ensure app still works
- Can revert to hardcoded colors by removing `var()` references

## Open Questions

None - all requirements clarified by user.
