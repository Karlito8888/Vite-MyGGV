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
The system SHALL provide user authentication state management through Supabase authentication.

#### Scenario: User login
- **WHEN** a user provides valid credentials
- **THEN** the system SHALL authenticate the user
- **AND** provide user state to components

#### Scenario: User logout
- **WHEN** a user logs out
- **THEN** the system SHALL clear authentication state
- **AND** redirect to login page

#### Scenario: Protected routes
- **WHEN** an unauthenticated user accesses a protected route
- **THEN** the system SHALL redirect to login page
- **AND** preserve the intended destination

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

