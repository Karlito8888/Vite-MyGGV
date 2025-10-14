## ADDED Requirements

### Requirement: Realtime Messages Header Subscription
The Header component SHALL subscribe to Supabase Postgres Changes for the messages_header table to receive real-time updates when messages are inserted, updated, or deleted.

#### Scenario: New Message Received
- **GIVEN** User is logged in and viewing any page
- **WHEN** New message is inserted into messages_header table for this user
- **THEN** Header component immediately updates to show new message count/content

#### Scenario: Message Read Status Updated
- **GIVEN** User has unread messages displayed in header
- **WHEN** Message read status is updated in database
- **THEN** Header reflects the updated read status immediately

#### Scenario: Message Deleted
- **GIVEN** User has messages displayed in header
- **WHEN** Message is deleted from messages_header table
- **THEN** Header removes the deleted message from display

### Requirement: Realtime Subscription Lifecycle Management
The Header component SHALL properly manage the realtime subscription lifecycle including setup, error handling, and cleanup.

#### Scenario: Connection Lost
- **GIVEN** Header has active realtime subscription
- **WHEN** Network connection is lost
- **THEN** Subscription attempts to reconnect when connection is restored
- **AND** UI gracefully handles connection state

#### Scenario: Component Unmount
- **GIVEN** User navigates away from page with Header component
- **WHEN** Header component unmounts
- **THEN** Realtime subscription is properly cleaned up
- **AND** No memory leaks occur

### Requirement: Performance and Resource Management
The realtime subscription SHALL maintain optimal performance and resource usage without impacting page load or mobile data consumption.

#### Scenario: Subscription Performance
- **GIVEN** User has active realtime subscription
- **WHEN** Messages are frequently updated
- **THEN** Subscription processing does not impact UI responsiveness
- **AND** Memory usage remains stable with proper cleanup