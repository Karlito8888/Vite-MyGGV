---
agent: build
description: Update supabase-functions-triggers.md with latest custom functions and triggers from Supabase database.
---

**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- Automatically exclude PostGIS and system functions to focus on custom objects in the `public` schema.
- **CRITICAL**: Always reference `AGENTS.md` at project root for Archon MCP server integration, task management, and documentation access rules.

**Steps**
1. Connect to the Supabase database using MCP Supabase tools.
2. Query custom functions from the database, excluding PostGIS and system functions.
3. Query custom triggers from the database.
4. Generate or update `supabase-functions-triggers.md` with:
   - A summary of each function/trigger
   - The complete SQL code for each object
   - Clear formatting with sections for functions and triggers
5. Verify the output file is properly formatted and contains all custom objects.

**Reference**
- Use `mcp_supabase_execute_sql` to query database metadata for functions and triggers.
- Focus on objects in the `public` schema and exclude system/PostGIS functions.
- The generated file should serve as documentation for custom database logic.