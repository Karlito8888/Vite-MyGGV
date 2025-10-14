## ADDED Requirements
### Requirement: Online Status Indicator
The Avatar component SHALL display a visual indicator when the user is online.

#### Scenario: Green border for online status
- **WHEN** the user's presence state is "online"
- **THEN** the Avatar component SHALL display a green border
- **AND** the green border SHALL be visually distinct from the default border
- **AND** the indicator SHALL be responsive across all device sizes

#### Scenario: Default border for offline status
- **WHEN** the user's presence state is "offline" or unknown
- **THEN** the Avatar component SHALL display the default border color
- **AND** the component SHALL maintain existing styling behavior

## MODIFIED Requirements
### Requirement: Avatar Component Interface
The Avatar component SHALL accept an optional online status prop.

#### Scenario: Online status prop
- **WHEN** an `isOnline` prop is provided to the Avatar component
- **THEN** the component SHALL apply appropriate styling based on the prop value
- **AND** the prop SHALL be optional with a default value of false
- **AND** the component SHALL maintain backward compatibility when the prop is not provided

#### Scenario: Dynamic status updates
- **WHEN** the online status prop changes during component lifecycle
- **THEN** the Avatar component SHALL update its visual appearance immediately
- **AND** the transition SHALL be smooth and visually appealing
- **AND** the component SHALL handle rapid status changes gracefully