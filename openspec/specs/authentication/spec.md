# Authentication System

## Purpose
Provide consistent authentication state management across all components using the modern `useAuth` hook pattern.
## Requirements
### Requirement: Authentication Hook Usage
All components SHALL use the `useAuth` hook for authentication state management instead of importing `AuthContext` directly.

#### Scenario: Component authentication access
- **WHEN** a component needs authentication state
- **THEN** it SHALL import `useAuth` from `../utils/useAuth`
- **AND** call `useAuth()` to get auth context
- **AND** NOT import `AuthContext` directly

#### Scenario: Consistent authentication pattern
- **WHEN** reviewing component authentication code
- **THEN** all components SHALL follow the same `useAuth` pattern
- **AND** no components shall use `useContext(AuthContext)`

### Requirement: User Authentication State
The system SHALL provide user authentication state management through Supabase authentication using email/password credentials with smooth transitions and no visual flashes.

#### Scenario: User login with email and password
- **WHEN** a user provides valid email and password
- **THEN** the system SHALL authenticate the user using signInWithPassword
- **AND** provide user state to components without visual flashes
- **AND** redirect to appropriate page based on onboarding status seamlessly
- **AND** display loading states during authentication processing

#### Scenario: Authentication state transitions
- **WHEN** authentication state changes (login/logout)
- **THEN** the system SHALL maintain loading states during transition
- **AND** prevent intermediate UI flashes
- **AND** ensure smooth visual transitions between auth states

#### Scenario: OAuth authentication flow
- **WHEN** a user authenticates via OAuth provider
- **THEN** the system SHALL handle callback without showing login page flash
- **AND** maintain loading state during OAuth processing
- **AND** redirect to appropriate destination after successful auth

### Requirement: Email Password Authentication Form
The login form SHALL collect both email address and password from users for authentication.

#### Scenario: Form validation
- **WHEN** user submits login form
- **THEN** email field SHALL be validated for proper format
- **AND** password field SHALL be required
- **AND** appropriate error messages SHALL be displayed for invalid inputs

#### Scenario: Password input security
- **WHEN** user enters password
- **THEN** password field SHALL use type="password"
- **AND** password SHALL be masked during input
- **AND** password SHALL not be displayed in error messages

#### Scenario: Form submission
- **WHEN** user submits valid email and password
- **THEN** form SHALL call signInWithPassword with provided credentials
- **AND** display loading state during authentication
- **AND** handle success and error responses appropriately

### Requirement: Real-time User Presence
The system SHALL provide real-time user presence tracking using Supabase Presence functionality.

#### Scenario: User comes online
- **WHEN** a user authenticates and connects to the application
- **THEN** the system SHALL subscribe to a presence channel for that user
- **AND** the user's presence state SHALL be updated to "online"

#### Scenario: User goes offline
- **WHEN** a user disconnects or closes the application
- **THEN** the system SHALL automatically clean up the presence state
- **AND** the user's presence state SHALL be updated to "offline"

#### Scenario: Presence state synchronization
- **WHEN** multiple users are connected to the same presence channel
- **THEN** the system SHALL broadcast presence changes to all connected clients
- **AND** each client SHALL maintain an up-to-date presence state for all users

### Requirement: Authentication Context
The authentication context SHALL manage user presence state alongside authentication status.

#### Scenario: Authentication with presence
- **WHEN** a user successfully authenticates
- **THEN** the system SHALL initialize presence tracking
- **AND** the authentication context SHALL provide presence state to child components
- **AND** the presence state SHALL include online/offline status for the current user

#### Scenario: Authentication cleanup
- **WHEN** a user logs out or authentication expires
- **THEN** the system SHALL unsubscribe from presence channels
- **AND** all presence state SHALL be cleaned up
- **AND** resources SHALL be properly released

### Requirement: OAuth Provider Support
The system SHALL support multiple OAuth providers for user authentication including Google, Facebook, and Microsoft Azure.

#### Scenario: Azure OAuth authentication
- **WHEN** a user clicks "Continue with Microsoft" button
- **THEN** the system SHALL initiate Azure OAuth flow via Supabase
- **AND** redirect user to Microsoft authentication
- **AND** handle authentication callback appropriately

#### Scenario: OAuth provider loading states
- **WHEN** any OAuth authentication is in progress
- **THEN** the system SHALL display "Connecting..." text
- **AND** disable the respective provider button
- **AND** maintain consistent loading behavior across all providers

#### Scenario: OAuth error handling
- **WHEN** OAuth authentication fails for any provider
- **THEN** the system SHALL display appropriate error message
- **AND** clear loading state
- **AND** allow user to retry authentication

#### Scenario: Visual consistency across providers
- **WHEN** displaying OAuth provider buttons
- **THEN** all buttons SHALL follow consistent structure and styling
- **AND** each provider SHALL use appropriate brand colors and logos
- **AND** maintain responsive design across all viewport sizes

### Requirement: Authentication Loading States
The system SHALL provide consistent loading states during all authentication operations to prevent visual discontinuities.

#### Scenario: Authentication in progress
- **WHEN** any authentication operation is in progress
- **THEN** the system SHALL display appropriate loading indicator
- **AND** prevent navigation away from current view
- **AND** maintain UI stability until operation completes

#### Scenario: Authentication verification
- **WHEN** verifying authentication state or onboarding status
- **THEN** the system SHALL show loading state
- **AND** prevent route changes during verification
- **AND** only redirect after verification is complete

### Requirement: Seamless Route Transitions
The system SHALL handle route transitions during authentication without visual artifacts.

#### Scenario: Post-authentication redirect
- **WHEN** user successfully authenticates
- **THEN** the system SHALL redirect directly to destination page
- **AND** bypass intermediate login page display
- **AND** maintain loading state during redirect

#### Scenario: Protected route access
- **WHEN** accessing protected routes during auth state changes
- **THEN** the system SHALL handle transitions smoothly
- **AND** prevent flashing between login and protected content
- **AND** show appropriate loading states

