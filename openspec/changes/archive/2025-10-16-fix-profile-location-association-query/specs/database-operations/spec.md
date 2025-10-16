## MODIFIED Requirements

### Requirement: Profile Location Association Query Syntax
The system SHALL use correct Supabase query syntax when retrieving profile location associations with foreign key relationships, ensuring proper error handling and RLS compliance.

#### Scenario: Successful location data retrieval
- **WHEN** onboardingService queries profile_location_associations with location relationships
- **THEN** the query SHALL use proper foreign key syntax
- **AND** SHALL return location data without 406 errors
- **AND** SHALL respect RLS policies for authenticated users

#### Scenario: Missing location association
- **WHEN** a user has no location association
- **THEN** the service SHALL handle null results gracefully
- **AND** SHALL not throw errors for missing location data
- **AND** SHALL provide default empty values for block/lot

#### Scenario: RLS policy enforcement
- **WHEN** querying profile_location_associations
- **THEN** RLS policies SHALL ensure users can only read their own associations
- **AND** authenticated users SHALL have read access to their profile_location_associations
- **AND** queries SHALL include proper authentication context