## MODIFIED Requirements
### Requirement: User Context Hook
The system SHALL provide a useUser hook for accessing user authentication state in components.

#### Scenario: Hook usage in Header component
- **WHEN** Header component imports useUser
- **THEN** the hook returns user state without import errors
- **AND** the hook provides access to authentication context

#### Scenario: Hook provides user data
- **WHEN** useUser is called in any component
- **THEN** it returns user object from UserContext
- **AND** it provides loading state
- **AND** it provides authentication status