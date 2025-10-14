# Avatar Component Design

## Component Architecture

### Avatar Component Structure
```jsx
<Avatar 
  src={profile.avatar_url}
  alt="User avatar"
  size="medium" // small, medium, large
  fallback="U" // Initial or default icon
  className="custom-class" // Optional additional classes
/>
```

### Props Interface
- `src` (string): URL to avatar image
- `alt` (string): Alt text for accessibility
- `size` (string): Size variant - 'small' (32px), 'medium' (64px), 'large' (96px)
- `fallback` (string): Text/initial to show when no image
- `className` (string): Additional CSS classes

### Size Variants
- **Small**: 32x32px - for headers, lists, comments
- **Medium**: 64x64px - default size, for profile sections
- **Large**: 96x96px - for detailed profile views

### Fallback Strategy
1. Show user initial (first letter of name) if available
2. Show default "U" for user
3. Apply consistent background color
4. Use CSS-only fallback (no additional dependencies)

### CSS Classes
- `.avatar` - Base container
- `.avatar--small`, `.avatar--medium`, `.avatar--large` - Size variants
- `.avatar__image` - Image element
- `.avatar__fallback` - Fallback container
- `.avatar__fallback-text` - Fallback text

## Integration Points

### Current Usage (Profile.jsx)
Lines 185-192 currently have inline avatar logic that will be replaced:
```jsx
{profile.avatar_url && (
  <div className="profile-section">
    <h2>Avatar</h2>
    <div className="profile-avatar">
      <img src={profile.avatar_url} alt="Profile avatar" />
    </div>
  </div>
)}
```

### Future Usage Opportunities
- Header component (user menu)
- User lists/directories
- Comments/forums
- Chat interfaces
- Onboarding flow

## Technical Considerations

### Performance
- Lazy loading for avatar images
- Proper image optimization
- Cache-friendly URLs (Supabase storage)

### Accessibility
- Proper alt text support
- Semantic HTML structure
- Keyboard navigation support

### Responsive Design
- Mobile-first approach
- Flexible sizing
- Touch-friendly interaction areas

### Error Handling
- Graceful fallback for broken images
- Loading states
- Network error handling