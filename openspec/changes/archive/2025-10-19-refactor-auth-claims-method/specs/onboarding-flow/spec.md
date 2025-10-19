## MODIFIED Requirements
### Requirement: Post-Login Onboarding Check
The system SHALL check the user's onboarding completion status after successful authentication using claims-based user identification.

#### Scenario: New user login
- **WHEN** a user authenticates with `onboarding_completed = false` or null
- **THEN** the system SHALL extract user ID from `data.claims.sub`
- **AND** fetch the user's profile from `public.profiles` table using claims.sub
- **AND** redirect to `/onboarding` page if onboarding is incomplete
- **AND** the user SHALL not access protected routes until onboarding is completed

#### Scenario: Returning user login
- **WHEN** a user authenticates with `onboarding_completed = true`
- **THEN** the system SHALL extract user ID from `data.claims.sub`
- **AND** verify onboarding status using claims-based user identification
- **AND** redirect directly to `/home` page
- **AND** bypass the onboarding page

#### Scenario: Onboarding status verification
- **WHEN** checking onboarding status
- **THEN** the system SHALL use `data.claims.sub` as the user identifier
- **AND** fetch the user's profile from `public.profiles` table
- **AND** verify the `onboarding_completed` boolean field
- **AND** handle loading states appropriately during claims verification

### Requirement: Protected Route Enhancement
Protected routes SHALL require both claims-based authentication and completed onboarding verification.

#### Scenario: Protected route access without onboarding
- **WHEN** an authenticated user with incomplete onboarding tries to access a protected route
- **THEN** the system SHALL verify authentication using `getClaims()`
- **AND** extract user ID from `data.claims.sub`
- **AND** check onboarding status using claims-based identification
- **AND** redirect to `/onboarding` page
- **AND** preserve the intended destination for post-onboarding redirect

#### Scenario: Protected route access with onboarding
- **WHEN** an authenticated user with completed onboarding accesses a protected route
- **THEN** the system SHALL verify authentication using claims-based approach
- **AND** allow access to the requested route
- **AND** not redirect to onboarding

## ADDED Requirements
### Requirement: Claims-Based Onboarding Service
The onboarding service SHALL use claims-based user identification for all onboarding operations.

#### Scenario: Onboarding completion with claims
- **WHEN** completing onboarding process
- **THEN** the service SHALL use `data.claims.sub` as the user identifier
- **AND** update the user's profile with onboarding completion status
- **AND** set `onboarding_completed` to true using claims.sub
- **AND** handle avatar upload and location assignment with claims-based identification

#### Scenario: Onboarding status retrieval
- **WHEN** retrieving onboarding status
- **THEN** the service SHALL use `data.claims.sub` to query the profiles table
- **AND** return the current onboarding completion status
- **AND** handle cases where no profile exists yet