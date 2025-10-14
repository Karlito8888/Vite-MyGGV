# Fix useAuth Import Error

## Problem
Login.jsx:4 throws `SyntaxError: The requested module '/src/utils/AuthContext.jsx' does not provide an export named 'useAuth'`

## Root Cause
The Login component imports `useAuth` from `AuthContext.jsx` but the `useAuth` export is actually in `useAuth.js`.

## What Changes
- Update import statement in Login.jsx from `../utils/AuthContext` to `../utils/useAuth`
- Verify no other components have similar import issues

## Solution
Update the import statement in Login.jsx to import `useAuth` from the correct file (`useAuth.js`).

## Impact
- Resolves the module import error
- Allows the Login component to access authentication context
- Enables proper authentication flow

## Scope
Single file change with no architectural impact.

## Why
This fix is critical because the current import error prevents the Login component from loading, blocking user access to the entire application. The authentication flow is completely broken without this fix, making the app unusable for new users.