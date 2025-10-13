## ADDED Requirements

### Requirement: CRUD Service Layer Architecture

The system SHALL provide a centralized service layer for all database operations using the Supabase SDK, organized by table with clear separation of concerns.

#### Scenario: Service module structure
- **WHEN** a developer needs to perform database operations
- **THEN** they SHALL use the appropriate service module from `src/services/`
- **AND** each table SHALL have its own dedicated service file

#### Scenario: Service exports standard CRUD operations
- **WHEN** a service module is imported
- **THEN** it SHALL export functions for create, read, update, and delete operations
- **AND** each function SHALL be documented with JSDoc comments

### Requirement: RLS Policy Compliance

All CRUD operations SHALL respect and enforce the Row Level Security (RLS) policies defined in the database for each table.

#### Scenario: User can only modify own records
- **WHEN** a user attempts to update a record with `profile_id` ownership
- **THEN** the operation SHALL succeed only if `auth.uid()` matches the `profile_id`
- **AND** the service SHALL rely on Supabase RLS enforcement

#### Scenario: Public read access
- **WHEN** a table has public read RLS policy (e.g., categories, locations)
- **THEN** any user SHALL be able to query records
- **AND** the service SHALL use standard `.select()` without additional filters

#### Scenario: Admin-only operations
- **WHEN** an operation requires admin privileges (e.g., location management)
- **THEN** the RLS policy SHALL verify `profiles.is_admin = true`
- **AND** the service SHALL document this requirement in comments

### Requirement: Category Services

The system SHALL provide CRUD services for business and service category tables with public read and authenticated write access.

#### Scenario: List all active categories
- **WHEN** `listBusinessInsideCategories()` is called
- **THEN** it SHALL return all categories where `is_active = true`
- **AND** use `.select()` with `.eq('is_active', true)` filter

#### Scenario: Create new category
- **WHEN** `createBusinessInsideCategory(data)` is called by authenticated user
- **THEN** it SHALL insert the category using `.insert()`
- **AND** return the created category or error

#### Scenario: Update category
- **WHEN** `updateBusinessInsideCategory(id, data)` is called by authenticated user
- **THEN** it SHALL update the category using `.update().eq('id', id)`
- **AND** return the updated category or error

### Requirement: Profile Services

The system SHALL provide CRUD services for user profiles with public read access and owner-only write access.

#### Scenario: Get profile by ID
- **WHEN** `getProfileById(id)` is called
- **THEN** it SHALL return the profile using `.select().eq('id', id).single()`
- **AND** return null if profile doesn't exist

#### Scenario: Update own profile
- **WHEN** `updateProfile(id, data)` is called
- **THEN** it SHALL update using `.update(data).eq('id', id)`
- **AND** RLS SHALL ensure user can only update their own profile

#### Scenario: List all profiles
- **WHEN** `listProfiles()` is called
- **THEN** it SHALL return all non-deleted profiles
- **AND** filter by `.is('deleted_at', null)`

### Requirement: Location Services

The system SHALL provide CRUD services for locations with public read and admin-only write access.

#### Scenario: List all locations
- **WHEN** `listLocations()` is called
- **THEN** it SHALL return all non-deleted locations
- **AND** filter by `.is('deleted_at', null)`

#### Scenario: Get location by block and lot
- **WHEN** `getLocationByBlockLot(block, lot)` is called
- **THEN** it SHALL return the location using `.select().eq('block', block).eq('lot', lot).single()`

#### Scenario: Admin creates location
- **WHEN** `createLocation(data)` is called by admin
- **THEN** it SHALL insert using `.insert(data)`
- **AND** RLS SHALL verify admin status

### Requirement: Business Services

The system SHALL provide CRUD services for user businesses (inside and outside) with owner-only write access and public read for active listings.

#### Scenario: List user's own businesses
- **WHEN** `listMyBusinessesInside(userId)` is called
- **THEN** it SHALL return businesses using `.select().eq('profile_id', userId)`

#### Scenario: List all active businesses
- **WHEN** `listActiveBusinessesInside()` is called
- **THEN** it SHALL return businesses using `.select().eq('is_active', true)`

#### Scenario: Create business
- **WHEN** `createBusinessInside(data)` is called
- **THEN** it SHALL insert using `.insert(data)`
- **AND** RLS SHALL ensure `profile_id` matches `auth.uid()`

#### Scenario: Update own business
- **WHEN** `updateBusinessInside(id, data)` is called
- **THEN** it SHALL update using `.update(data).eq('id', id)`
- **AND** RLS SHALL ensure user owns the business

#### Scenario: Delete own business
- **WHEN** `deleteBusinessInside(id)` is called
- **THEN** it SHALL delete using `.delete().eq('id', id)`
- **AND** RLS SHALL ensure user owns the business

### Requirement: Marketplace Services

The system SHALL provide CRUD services for marketplace listings with owner-only write access and filtered read access.

#### Scenario: List active marketplace listings
- **WHEN** `listActiveListings()` is called
- **THEN** it SHALL return listings using `.select().eq('is_active', true)`

#### Scenario: List user's own listings
- **WHEN** `listMyListings(userId)` is called
- **THEN** it SHALL return listings using `.select().eq('profile_id', userId)`

#### Scenario: Create listing
- **WHEN** `createListing(data)` is called
- **THEN** it SHALL insert using `.insert(data)`
- **AND** RLS SHALL ensure `profile_id` matches `auth.uid()`

#### Scenario: Update own listing
- **WHEN** `updateListing(id, data)` is called
- **THEN** it SHALL update using `.update(data).eq('id', id)`
- **AND** RLS SHALL ensure user owns the listing

### Requirement: Messaging Services

The system SHALL provide CRUD services for chat, private messages, and related messaging features with appropriate access controls.

#### Scenario: Send private message
- **WHEN** `sendPrivateMessage(data)` is called
- **THEN** it SHALL insert using `.insert(data)`
- **AND** RLS SHALL ensure `sender_id` matches `auth.uid()`

#### Scenario: Get conversation messages
- **WHEN** `getConversationMessages(userId, otherUserId)` is called
- **THEN** it SHALL return messages using `.select()` with sender/receiver filters
- **AND** RLS SHALL ensure user is sender or receiver

#### Scenario: Mark message as read
- **WHEN** `markMessageAsRead(messageId)` is called
- **THEN** it SHALL update using `.update({ read_at: new Date() }).eq('id', messageId)`
- **AND** RLS SHALL ensure user is the receiver

#### Scenario: Delete own message
- **WHEN** `deletePrivateMessage(messageId)` is called
- **THEN** it SHALL soft delete using `.update({ deleted_at: new Date() }).eq('id', messageId)`
- **AND** RLS SHALL ensure user is the sender

### Requirement: Forum Services

The system SHALL provide CRUD services for forums and threads with public read and authenticated write access.

#### Scenario: List all forums
- **WHEN** `listForums()` is called
- **THEN** it SHALL return all forums using `.select()`

#### Scenario: Create forum
- **WHEN** `createForum(data)` is called by authenticated user
- **THEN** it SHALL insert using `.insert(data)`
- **AND** set `created_by` to current user ID

#### Scenario: List threads in forum
- **WHEN** `listThreads(forumId)` is called
- **THEN** it SHALL return threads using `.select().eq('forum_id', forumId)`

#### Scenario: Create thread
- **WHEN** `createThread(data)` is called by authenticated user
- **THEN** it SHALL insert using `.insert(data)`
- **AND** set `created_by` to current user ID

### Requirement: Error Handling

All service functions SHALL implement consistent error handling and return structured responses.

#### Scenario: Successful operation
- **WHEN** a CRUD operation succeeds
- **THEN** the service SHALL return `{ data, error: null }`
- **AND** data SHALL contain the result

#### Scenario: Operation fails
- **WHEN** a CRUD operation fails
- **THEN** the service SHALL return `{ data: null, error }`
- **AND** error SHALL contain the Supabase error object

#### Scenario: Network error
- **WHEN** a network error occurs
- **THEN** the service SHALL catch the error
- **AND** return a structured error response

### Requirement: Service Documentation

Each service module SHALL include comprehensive documentation for developers.

#### Scenario: JSDoc comments on functions
- **WHEN** a developer views a service function
- **THEN** it SHALL have JSDoc comments describing parameters, return values, and RLS policies

#### Scenario: RLS policy documentation
- **WHEN** a service file is opened
- **THEN** it SHALL include a comment block at the top documenting the table's RLS policies

#### Scenario: Usage examples
- **WHEN** a developer needs to use a service
- **THEN** the `src/services/README.md` SHALL provide usage examples for common operations
