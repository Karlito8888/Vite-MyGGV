# header-avatar-integration Specification

## Purpose
TBD - created by archiving change 2025-10-17-integrate-avatar-header. Update Purpose after archive.
## Requirements
### Requirement: Header Avatar Positioning
The user's avatar SHALL be displayed in the header with absolute positioning on the left side.

#### Scenario:
- WHEN a user is authenticated and views any page with the header
- THEN the avatar SHALL appear positioned absolutely on the left side of the header
- AND the avatar SHALL be positioned at 50% vertical center (top: 50%, transform: translateY(-50%))
- AND the avatar SHALL overlap 50% of its width into the main content area
- AND the avatar SHALL maintain proper z-index layering above header background

### Requirement: Avatar Integration with Existing Header
The avatar SHALL be integrated into the existing Header component without disrupting current functionality.

#### Scenario:
- WHEN the header renders for authenticated users
- THEN the avatar SHALL be added alongside the existing message carousel
- AND the message carousel SHALL maintain its current positioning and behavior
- AND the GGV logo SHALL continue to display for non-authenticated users
- AND all existing header functionality SHALL remain unchanged

### Requirement: JavaScript-Only Transitions
Avatar appearance and disappearance SHALL use JavaScript-only transitions for smooth effects.

#### Scenario:
- WHEN the avatar needs to appear or disappear
- THEN transitions SHALL be implemented using JavaScript requestAnimationFrame
- AND transitions SHALL NOT use CSS animations or transitions
- AND fade effects SHALL have 300ms duration for smooth appearance
- AND transitions SHALL be cancellable and properly cleaned up

### Requirement: Responsive Avatar Sizing
The avatar SHALL adapt its size appropriately across different device sizes.

#### Scenario:
- WHEN viewing on mobile devices (< 768px)
- THEN the avatar SHALL use small size (32px)
- AND the overlap SHALL be adjusted for smaller screens

#### Scenario:
- WHEN viewing on tablet devices (768px - 1024px)
- THEN the avatar SHALL use medium size (48px)
- AND the standard 50% overlap SHALL be maintained

#### Scenario:
- WHEN viewing on desktop devices (> 1024px)
- THEN the avatar SHALL use medium-large size (64px)
- AND full 50% overlap SHALL be implemented

### Requirement: Avatar Data Integration
The avatar SHALL display the current authenticated user's profile image and SHALL use the protected usePresence hook for accessing presence context data.

#### Scenario:
- WHEN a user is logged in
- THEN the avatar SHALL display the user's profile image from the authentication context
- AND the avatar SHALL use the existing Avatar component with appropriate props
- AND fallback handling SHALL be implemented for missing avatar images
- AND default avatar SHALL be used when no user image is available
- AND presence context SHALL be accessed through the usePresence() hook for safety
- AND direct useContext(PresenceContext) usage SHALL be avoided to prevent runtime errors

### Requirement: Performance Optimization
The avatar integration SHALL maintain optimal performance characteristics.

#### Scenario:
- WHEN the header component renders
- THEN avatar loading SHALL not block header content rendering
- AND avatar images SHALL be lazy loaded after main content
- AND transitions SHALL use efficient requestAnimationFrame
- AND memory SHALL be properly cleaned up on component unmount
- AND debug console.log statements SHALL be removed to prevent console pollution and performance overhead

### Requirement: Accessibility Compliance
The avatar SHALL maintain accessibility standards and screen reader compatibility.

#### Scenario:
- WHEN users with accessibility needs interact with the header
- THEN the avatar SHALL have proper alt text describing the user
- AND transitions SHALL respect prefers-reduced-motion settings
- AND the avatar SHALL not interfere with keyboard navigation
- AND appropriate ARIA attributes SHALL be applied

### Requirement: State Management Integration
Avatar visibility and transitions SHALL be properly managed through component state, and Realtime subscription state SHALL be managed through service functions.

#### Scenario:
- WHEN managing avatar appearance states
- THEN component state SHALL track visibility (visible/hidden)
- AND transition state SHALL be tracked (idle/transitioning)
- AND state changes SHALL trigger appropriate JavaScript transitions
- AND cleanup SHALL occur on component unmount
- AND Realtime subscription state SHALL be managed through service functions
- AND subscription errors SHALL be handled through service callbacks

### Requirement: Service-Based Realtime Subscription
Header message Realtime subscriptions SHALL be managed through the messagesHeaderService layer to separate data concerns from UI components.

#### Scenario:
- WHEN the Header component needs real-time message updates
- THEN subscription logic SHALL be handled by messagesHeaderService functions
- AND the Header SHALL call subscribeToHeaderMessages() to establish connection
- AND the Header SHALL receive subscription status callbacks through the service
- AND cleanup SHALL be handled by unsubscribeFromHeaderMessages() function
- AND no direct Supabase channel management SHALL exist in UI components

