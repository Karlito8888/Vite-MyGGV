---
agent: build
description: Implement an approved OpenSpec change and keep tasks in sync.
---
<!-- OPENSPEC:START -->
**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- Refer to `openspec/AGENTS.md` (located inside the `openspec/` directory—run `ls openspec` or `openspec update` if you don't see it) if you need additional OpenSpec conventions or clarifications.
- **CRITICAL**: Always reference `AGENTS.md` at project root for Archon MCP server integration, task management, and documentation access rules.
- **CRITICAL**: Use MCP Archon server exclusively for task management. All tasks must be created and managed at "http://127.0.0.1:3737/projects" using Archon MCP tools (`find_tasks()`, `manage_task()`, `find_projects()`). See `AGENTS.md` at project root for complete Archon workflow and commands.

**Steps**
Track these steps as TODOs and complete them one by one.
1. **MANDATORY**: Check Archon MCP server tasks first using `find_tasks(filter_by="status", filter_value="todo")` before starting any work (see `AGENTS.md` at project root for complete workflow)
2. Read `changes/<id>/proposal.md`, `design.md` (if present), and `tasks.md` to confirm scope and acceptance criteria.
3. **MANDATORY**: Create/update tasks in Archon at "http://127.0.0.1:3737/projects" using `manage_task()` before implementation (see `AGENTS.md` at project root for complete workflow)
4. Work through tasks sequentially, keeping edits minimal and focused on the requested change.
5. **MANDATORY**: Update task status in Archon (`manage_task("update", task_id="...", status="doing/review/done")`) as you progress (see `AGENTS.md` at project root for complete workflow)
6. Confirm completion before updating statuses—make sure every item in `tasks.md` is finished.
7. Update the checklist after all work is done so each task is marked `- [x]` and reflects reality.
8. Reference `openspec list` or `openspec show <item>` when additional context is required.

**Reference**
- Use `openspec show <id> --json --deltas-only` if you need additional context from the proposal while implementing.
<!-- OPENSPEC:END -->
