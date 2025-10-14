# Subscribe Header to Messages Header Realtime

## Change Overview
Subscribe the Header component to Supabase Postgres Changes for the messages_header table to enable real-time updates when new messages arrive.

## Problem Statement
Currently the Header component doesn't receive real-time updates when new messages are added to the messages_header table. Users need to manually refresh or navigate to see new message counts or updates.

## Proposed Solution
Implement Supabase Postgres Changes subscription in the Header component using the official Supabase JavaScript client to listen for INSERT, UPDATE, and DELETE operations on the messages_header table.

## Scope
- Modify Header component to include real-time subscription
- Handle subscription lifecycle (mount/unmount)
- Update Header state when messages_header changes occur
- Ensure proper cleanup to prevent memory leaks

## Constraints
- Must use Supabase JavaScript client (no external realtime libraries)
- Follow existing project patterns (Vite + React, no TypeScript)
- Maintain mobile-first responsive design
- Respect Supabase RLS policies

## Success Criteria
1. Header component receives real-time updates when messages_header table changes
2. Subscription is properly cleaned up when component unmounts
3. No memory leaks or performance issues
4. Existing Header functionality remains intact