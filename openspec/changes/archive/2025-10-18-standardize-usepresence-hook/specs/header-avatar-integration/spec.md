## MODIFIED Requirements
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