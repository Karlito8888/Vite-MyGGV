# Project Management Specification Deltas

## MODIFIED Requirements

### Requirement: Project Foundation Setup
The system SHALL establish a complete project foundation following the specified tech stack constraints.

#### Scenario: Vite.js PWA setup
- **WHEN** initializing the project
- **THEN** configure Vite.js with React and PWA plugin without TypeScript

#### Scenario: Supabase integration
- **WHEN** setting up backend services
- **THEN** configure Supabase client with authentication and RLS policies

#### Scenario: Routing system
- **WHEN** implementing navigation
- **THEN** create routing flow where Login is public, Onboarding is accessible after authentication, and Home requires authentication
- **AND** Onboarding SHALL NOT be protected by additional route guards
- **AND** Home SHALL be protected and redirect unauthenticated users to login

## ADDED Requirements

### Requirement: React 19 Best Practices
The system SHALL follow React 19 best practices for JSX and component imports.

#### Scenario: JSX auto-import
- **WHEN** writing JSX components
- **THEN** React import SHALL NOT be required for JSX syntax
- **AND** only specific hooks or APIs SHALL be imported when used

#### Scenario: StrictMode usage
- **WHEN** configuring React application
- **THEN** StrictMode SHALL be used following React 19 patterns
- **AND** application SHALL render without warnings

#### Scenario: Hook imports
- **WHEN** using React hooks
- **THEN** only required hooks SHALL be imported explicitly
- **AND** imports SHALL use named imports from 'react'
