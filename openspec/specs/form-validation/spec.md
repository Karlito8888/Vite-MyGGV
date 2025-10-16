# Form Validation System

## Purpose
Implement React Hook Form with Zod validation for improved form management, performance, and validation consistency in the onboarding flow.

## Requirements

### Requirement: React Hook Form Integration
The onboarding form SHALL use React Hook Form for state management and form control.

#### Scenario: Form initialization
- **WHEN** the onboarding component mounts
- **THEN** React Hook Form SHALL initialize with default values
- **AND** form state SHALL be managed by useForm hook
- **AND** manual useState for form data SHALL be removed

#### Scenario: Form input handling
- **WHEN** users interact with form fields
- **THEN** React Hook Form SHALL handle input changes automatically
- **AND** form validation SHALL trigger on blur and submit
- **AND** re-renders SHALL be optimized for performance

#### Scenario: Form submission
- **WHEN** the form is submitted
- **THEN** React Hook Form SHALL validate all fields
- **AND** only valid data SHALL be processed
- **AND** submission SHALL be prevented if validation fails

### Requirement: Zod Schema Validation
The onboarding form SHALL use Zod schemas for declarative validation rules.

#### Scenario: Validation schema definition
- **WHEN** defining validation rules
- **THEN** Zod schema SHALL define all field constraints
- **AND** validation messages SHALL be clear and user-friendly
- **AND** schema SHALL match existing validation logic

#### Scenario: Real-time validation
- **WHEN** users input data
- **THEN** Zod SHALL validate field values in real-time
- **AND** error messages SHALL display immediately
- **AND** validation SHALL be consistent across all fields

#### Scenario: Schema-based validation
- **WHEN** validating form data
- **THEN** Zod resolver SHALL integrate with React Hook Form
- **AND** validation errors SHALL be automatically mapped
- **AND** type safety SHALL be maintained without TypeScript

### Requirement: Form Error Handling
The form SHALL provide consistent error handling and user feedback.

#### Scenario: Validation error display
- **WHEN** validation fails
- **THEN** error messages SHALL display below relevant fields
- **AND** error styling SHALL match existing design
- **AND** errors SHALL clear when corrected

#### Scenario: Submission error handling
- **WHEN** form submission fails
- **THEN** error messages SHALL display at form level
- **AND** form data SHALL be preserved
- **AND** users SHALL be able to retry submission

### Requirement: Onboarding Service Simplification
The onboarding service SHALL focus on data persistence without validation logic.

#### Scenario: Service layer responsibility
- **WHEN** completing onboarding
- **THEN** onboardingService SHALL only handle data persistence
- **AND** validation SHALL be handled by React Hook Form
- **AND** service SHALL maintain existing error handling

#### Scenario: Data validation separation
- **WHEN** processing form data
- **THEN** validation logic SHALL be removed from service
- **AND** only validated data SHALL reach the service
- **AND** service SHALL assume data is pre-validated

## Cross-Reference Requirements

This specification enhances the existing onboarding flow in `openspec/specs/onboarding-flow/spec.md`:
- Improves form validation and user experience
- Maintains existing onboarding completion flow
- Preserves all current form fields and validation rules
- Enhances performance and maintainability