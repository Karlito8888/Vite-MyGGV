## Why
Add real-time presence functionality to show when users are online and visually indicate their connection status through the avatar component, following Supabase's official Presence documentation.

## What Changes
- Integrate Supabase Presence for real-time user status tracking
- Add green border to Avatar component when user is online
- Create presence context for managing connection state
- Implement presence channel subscription and sync logic

## Impact
- Affected specs: authentication, avatar-component
- Affected code: Avatar.jsx, Avatar.css, AuthContext.jsx, new presence utilities
- Real-time user status indication across the application