## MODIFIED Requirements

### Requirement: RLS Policy Compliance

All CRUD operations SHALL respect and enforce the Row Level Security (RLS) policies defined in the database for each table, with enhanced authentication verification using Supabase's `getClaims()` method instead of `getUser()` for improved security and performance.

#### Scenario: User can only modify own records
- **WHEN** a user attempts to update a record with `profile_id` ownership
- **THEN** the operation SHALL succeed only if `getClaims()` verification passes and `auth.uid()` matches the `profile_id`
- **AND** the service SHALL use claims-based authentication before RLS enforcement

#### Scenario: Claims-based authentication verification
- **WHEN** a valid JWT token is present
- **AND** `getClaims()` is called
- **THEN** the system extracts user claims including sub, role, and email
- **AND** authentication state is set to authenticated
- **AND** subsequent operations use verified claims for user identity

#### Scenario: Invalid or expired claims
- **WHEN** `getClaims()` returns an error or invalid claims
- **THEN** the system handles authentication failure gracefully
- **AND** falls back to `getUser()` if necessary
- **AND** user is redirected to login or appropriate error state

#### Scenario: Protected route access
- **WHEN** accessing protected routes
- **THEN** `getClaims()` verifies JWT validity locally
- **AND** access is granted based on claims without server round-trip
- **AND** service operations use verified user identity from claims

### Requirement: Error Handling

All service functions SHALL implement consistent error handling and return structured responses, with enhanced authentication error handling for claims verification.

#### Scenario: Claims verification failure
- **WHEN** `getClaims()` fails or returns invalid claims
- **THEN** the service SHALL gracefully handle authentication errors
- **AND** provide fallback to `getUser()` when appropriate
- **AND** return structured error responses for authentication failures

#### Scenario: Successful operation
- **WHEN** a CRUD operation succeeds with verified claims
- **THEN** the service SHALL return `{ data, error: null }`
- **AND** data SHALL contain the result with verified user context

#### Scenario: Operation fails
- **WHEN** a CRUD operation fails
- **THEN** the service SHALL return `{ data: null, error }`
- **AND** error SHALL contain the Supabase error object or authentication error