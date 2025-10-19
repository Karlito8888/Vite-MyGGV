# Onboarding Flow System

## Purpose
Implement a conditional onboarding flow that checks user completion status after login and routes users appropriately.

## Requirements

### Requirement: Post-Login Onboarding Check
The system SHALL check the user's onboarding completion status after successful authentication using the centralized onboardingService instead of direct database queries.

#### Scenario: New user login with centralized service
- **WHEN** a user authenticates with `onboarding_completed = false` or null
- **THEN** the system SHALL extract user ID from `data.claims.sub`
- **AND** use onboardingService.getOnboardingStatusWithCache() to fetch status
- **AND** redirect to `/onboarding` page if onboarding is incomplete
- **AND** the user SHALL not access protected routes until onboarding is completed

#### Scenario: Returning user login with centralized service
- **WHEN** a user authenticates with `onboarding_completed = true`
- **THEN** the system SHALL extract user ID from `data.claims.sub`
- **AND** use onboardingService.getOnboardingStatusWithCache() to verify status
- **AND** redirect directly to `/home` page
- **AND** bypass the onboarding page

#### Scenario: Onboarding status verification with caching
- **WHEN** checking onboarding status
- **THEN** the system SHALL use `data.claims.sub` as the user identifier
- **AND** use onboardingService.getOnboardingStatusWithCache() to fetch status with caching
- **AND** verify the `onboarding_completed` boolean field
- **AND** handle loading states appropriately during claims verification

### Requirement: Enhanced Onboarding Page
The onboarding page SHALL use centralized redirect handling services for location approval notifications instead of implementing direct database queries.

#### Scenario: Avatar component integration
- **WHEN** displaying the onboarding form
- **THEN** the system SHALL replace the avatar_url input field with the Avatar component
- **AND** the Avatar component SHALL be configured for upload mode
- **AND** the component SHALL display the current avatar or default GGV logo
- **AND** users SHALL be able to upload new avatars through the component

#### Scenario: Location approval notification with centralized service
- **WHEN** a user's location request is approved
- **THEN** the system SHALL use onboardingService.checkAndHandleRedirect() for notification
- **AND** the service SHALL handle both notification display and flag clearing
- **AND** useAutoRedirect hook SHALL act as a thin wrapper around the service

### Requirement: Onboarding Service
The onboarding service SHALL handle avatar file uploads, storage, and location assignment with comprehensive error handling and centralized status checking.

#### Scenario: Enhanced error handling in onboarding service
- **WHEN** an error occurs during onboarding
- **THEN** the onboarding service SHALL provide detailed error messages
- **AND** SHALL log comprehensive debugging information
- **AND** SHALL handle avatar upload failures gracefully
- **AND** SHALL validate all required input fields before processing

#### Scenario: Centralized status checking with caching
- **WHEN** multiple components need onboarding status
- **THEN** the onboardingService SHALL provide getOnboardingStatusWithCache() method
- **AND** the service SHALL cache results for 5 minutes to reduce database queries
- **AND** the cache SHALL be invalidated when status changes
- **AND** all components SHALL use the same centralized method

#### Scenario: Consistent onboarding completion
- **WHEN** onboarding completes (both direct assignment and request scenarios)
- **THEN** `onboarding_completed` SHALL always be set to true
- **AND** users SHALL have access to the application
- **AND** subsequent status checks SHALL return consistent results
- **AND** the service SHALL remove duplicate method implementations

### Requirement: Protected Route Enhancement
Protected routes SHALL require both claims-based authentication and completed onboarding verification using the centralized service.

#### Scenario: Protected route access without onboarding
- **WHEN** an authenticated user with incomplete onboarding tries to access a protected route
- **THEN** the system SHALL verify authentication using `getClaims()`
- **AND** extract user ID from `data.claims.sub`
- **AND** check onboarding status using centralized onboardingService
- **AND** redirect to `/onboarding` page
- **AND** preserve the intended destination for post-onboarding redirect

#### Scenario: Protected route access with onboarding
- **WHEN** an authenticated user with completed onboarding accesses a protected route
- **THEN** the system SHALL verify authentication using `getClaims()`
- **AND** use onboarding status from the centralized service
- **AND** allow access to the requested route
- **AND** not redirect to onboarding

### Requirement: Location Information Collection
The system SHALL collect mandatory location information during onboarding.

#### Scenario: Location field validation
- **WHEN** a user submits the onboarding form
- **THEN** the system SHALL validate that block and lot fields are not empty
- **AND** ensure location data follows expected format
- **AND** show appropriate error messages for invalid location data

#### Scenario: Avatar file validation
- **WHEN** validating the onboarding form
- **THEN** the system SHALL validate uploaded avatar files instead of URLs
- **AND** the validation SHALL check for supported image formats (jpg, png, webp)
- **AND** the validation SHALL enforce reasonable file size limits
- **AND** the system SHALL provide clear error messages for invalid files

#### Scenario: Form submission with avatar
- **WHEN** submitting the onboarding form with avatar changes
- **THEN** the system SHALL include the processed avatar data in the submission
- **AND** the system SHALL handle both new uploads and existing avatars
- **AND** the form submission SHALL wait for avatar upload completion before proceeding
- **AND** the system SHALL provide appropriate loading states during upload

### Requirement: Claims-Based Onboarding Service
The onboarding service SHALL use claims-based user identification for all onboarding operations and provide centralized status checking with caching.

#### Scenario: Onboarding completion with claims
- **WHEN** completing onboarding process
- **THEN** the service SHALL use `data.claims.sub` as the user identifier
- **AND** update the user's profile with onboarding completion status
- **AND** set `onboarding_completed` to true using claims.sub
- **AND** handle avatar upload and location assignment with claims-based identification

#### Scenario: Onboarding status retrieval with caching
- **WHEN** retrieving onboarding status
- **THEN** the service SHALL use `data.claims.sub` to query the profiles table
- **AND** implement caching to reduce database queries
- **AND** return the current onboarding completion status
- **AND** handle cases where no profile exists yet

## ADDED Requirements

### Requirement: Centralized Redirect Handling Service
The system SHALL provide a combined method in onboardingService.js that handles both redirect checking and flag clearing to eliminate duplication and ensure atomic operations.

#### Scenario:
When checking if redirect is needed, components SHALL call onboardingService.checkAndHandleRedirect() instead of separate check and clear operations.

#### Scenario:
When redirect flag is found, the service SHALL handle both notification and flag clearing in one atomic operation.

### Requirement: Real-time Redirect Listener Service
The onboardingService SHALL provide a centralized method for setting up real-time redirect listeners to prevent multiple components from creating duplicate Supabase channels.

#### Scenario:
When components need real-time redirect updates, they SHALL use onboardingService.setupRealtimeRedirectListener() instead of setting up their own Supabase channels.

#### Scenario:
When redirect notification is received via real-time updates, the service SHALL handle the complete flow including flag clearing.

## Cross-Reference Requirements

This specification extends the existing authentication requirements in `openspec/specs/authentication/spec.md`:
- Builds upon the authentication hook usage patterns
- Extends protected route functionality
- Maintains consistency with existing auth context patterns