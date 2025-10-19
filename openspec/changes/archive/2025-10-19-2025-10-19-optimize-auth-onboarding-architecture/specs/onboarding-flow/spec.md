# Onboarding Flow Service Optimization

## Purpose
Clean up and consolidate the `onboardingService.js` by removing deprecated methods, eliminating redundancy, and focusing on core business logic.

## REMOVED Requirements

### Requirement: Deprecated Redirect Methods
Deprecated redirect methods SHALL be removed from `onboardingService.js`.

#### Scenario: checkRedirectNeeded removal
- **WHEN** reviewing `onboardingService.js` methods
- **THEN** the system SHALL remove `checkRedirectNeeded()` method
- **AND** SHALL remove all references to this deprecated method
- **AND** SHALL replace usage with `checkAndHandleRedirect()` method
- **AND** SHALL update documentation to reflect removal

#### Scenario: Deprecated method documentation
- **WHEN** documenting service methods
- **THEN** the system SHALL remove deprecated method documentation
- **AND** SHALL update method signatures
- **AND** SHALL clarify which methods to use instead
- **AND** SHALL provide migration guidance if needed

## MODIFIED Requirements

### Requirement: Status Verification Consolidation
Multiple status verification methods SHALL be consolidated into a single, optimized method.

#### Scenario: Status method unification
- **WHEN** verifying onboarding status
- **THEN** the system SHALL consolidate `getOnboardingStatus()` and `getOnboardingStatusWithCache()`
- **AND** SHALL create single `getOnboardingStatus()` method with built-in caching
- **AND** SHALL maintain the same caching behavior (5 minutes)
- **AND** SHALL preserve the same return interface

#### Scenario: Cache management preservation
- **WHEN** consolidating status methods
- **THEN** the system SHALL preserve existing cache logic
- **AND** SHALL maintain 5-minute cache TTL
- **AND** SHALL keep cache invalidation functionality
- **AND** SHALL preserve cache key management

#### Scenario: Method interface consistency
- **WHEN** providing the unified status method
- **THEN** the system SHALL maintain the same return object structure
- **AND** SHALL include `success`, `onboardingCompleted`, and `error` fields
- **AND** SHALL preserve error handling patterns
- **AND** SHALL keep the same method signature

### Requirement: Service Responsibility Focus
The service SHALL focus on core business logic, delegating redirect logic to hooks.

#### Scenario: Business logic retention
- **WHEN** cleaning up the service
- **THEN** the system SHALL keep all core onboarding business logic
- **AND** SHALL preserve location assignment workflows
- **AND** SHALL maintain profile data operations
- **AND** SHALL keep avatar upload functionality

#### Scenario: Redirect logic delegation
- **WHEN** handling redirect operations
- **THEN** the system SHALL delegate redirect logic to hooks
- **AND** SHALL keep essential service methods for hook usage
- **AND** SHALL remove business logic redirects from service
- **AND** SHALL maintain service API compatibility

#### Scenario: Real-time listener support
- **WHEN** providing real-time functionality
- **THEN** the system SHALL keep `setupRealtimeRedirectListener()` method
- **AND** SHALL maintain real-time channel management
- **AND** SHALL preserve listener cleanup functionality
- **AND** SHALL support hook-based real-time operations

### Requirement: Error Handling Consistency
All service methods SHALL have consistent error handling patterns.

#### Scenario: Standardized error responses
- **WHEN** handling errors in service methods
- **THEN** the system SHALL use consistent error response format
- **AND** SHALL include `success: false` for errors
- **AND** SHALL provide descriptive error messages
- **AND** SHALL maintain error logging consistency

#### Scenario: Error logging improvement
- **WHEN** logging errors in service methods
- **THEN** the system SHALL provide detailed error context
- **AND** SHALL include relevant parameters in logs
- **AND** SHALL use consistent log formatting
- **AND** SHALL help with debugging and troubleshooting

## ADDED Requirements

### Requirement: Method Organization
Service methods SHALL be organized logically with clear documentation.

#### Scenario: Method grouping
- **WHEN** organizing service methods
- **THEN** the system SHALL group related methods together
- **AND** SHALL separate status methods from business logic
- **AND** SHALL organize location-related methods
- **AND** SHALL group redirect support methods

#### Scenario: Documentation clarity
- **WHEN** documenting service methods
- **THEN** the system SHALL provide clear method descriptions
- **AND** SHALL document parameter types and requirements
- **AND** SHALL specify return value structures
- **AND** SHALL include usage examples where helpful

### Requirement: Performance Optimization
Service methods SHALL be optimized for performance while maintaining functionality.

#### Scenario: Database query optimization
- **WHEN** performing database operations
- **THEN** the system SHALL use efficient queries
- **AND** SHALL leverage existing caching mechanisms
- **AND** SHALL minimize unnecessary database calls
- **AND** SHALL optimize query performance

#### Scenario: Memory management
- **WHEN** managing service state
- **THEN** the system SHALL properly manage cache memory
- **AND** SHALL clean up unused cache entries
- **AND** SHALL prevent memory leaks
- **AND** SHALL optimize memory usage patterns

## Cross-Reference Requirements

This specification modifies requirements from:
- `openspec/specs/onboarding-flow/spec.md` - Cleans up onboarding service methods
- Current `onboardingService.js` implementation
- Existing caching and performance requirements
- Error handling and logging standards