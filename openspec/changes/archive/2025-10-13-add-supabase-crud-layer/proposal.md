## Why

The application currently lacks a structured CRUD layer for database operations. Each table in the database has specific RLS (Row Level Security) policies that must be respected when performing operations. A centralized, well-documented CRUD service layer will ensure consistency, maintainability, and proper security enforcement across all database interactions.

## What Changes

- Create a comprehensive CRUD service layer using Supabase SDK for all database tables (excluding `spatial_ref_sys`)
- Implement standard CRUD operations (Create, Read, Update, Delete) respecting each table's RLS policies
- Provide clear documentation of RLS constraints for each table
- Follow simple, non-over-engineered patterns aligned with project conventions
- Use only Supabase SDK methods (no raw SQL unless absolutely necessary)

## Impact

- Affected specs: New capability `database-operations`
- Affected code: 
  - New directory: `src/services/` for CRUD operations
  - Each table will have its own service module
  - Existing code using direct Supabase calls should migrate to use these services
- Benefits:
  - Centralized database logic
  - Easier testing and maintenance
  - Clear RLS policy documentation
  - Consistent error handling
  - Type-safe operations (via JSDoc comments)
