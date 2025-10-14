# Dynamic Header Content

## Summary
Modify the header component to display different content based on user authentication state:
- **No user**: Show current logo and h1 (MyGGV branding)
- **Authenticated user**: Display messages from `messages_header` table in an infinite loop carousel

## Problem Statement
Currently, the header always displays static branding content regardless of user authentication state. The application has a `messages_header` table with user-generated messages that should be showcased to authenticated users in an engaging carousel format.

## Proposed Solution
1. **Conditional Rendering**: Use authentication state to determine header content
2. **Message Carousel**: Implement infinite loop carousel for authenticated users
3. **Data Integration**: Fetch active messages from `messages_header` table
4. **Responsive Design**: Ensure carousel works on mobile devices

## Scope
- Modify `Header.jsx` component
- Add authentication state detection
- Implement carousel functionality with CSS animations
- Integrate with existing `messagesHeaderService`
- Add responsive styling

## Technical Approach
- Use `useAuth` hook for authentication state
- Fetch messages using `listActiveHeaderMessages()` service
- Implement CSS-based infinite carousel animation
- Handle empty message states gracefully
- Maintain mobile-first responsive design

## Success Criteria
- Header shows logo/h1 when no user is authenticated
- Header shows message carousel when user is authenticated
- Carousel loops infinitely without interruption
- Messages display correctly from database
- Responsive design works on all screen sizes
- Performance remains optimal