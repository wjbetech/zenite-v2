# Immediate TODO (curate me)

This file contains a prioritized, actionable set of next tasks based on the current implementation notes in `implementation.md` and `project_stack.md`. Curate and reorder as you like — each item is intentionally scoped small so we can work in short PRs.

## High priority

- [ ] Implement Projects table & migration (Prisma)

  - Add a `Project` model to `prisma/schema.prisma` (id, name, createdAt, updatedAt, ownerId?)
  - Create and apply a migration. Run `prisma generate`.

- [ ] Add Projects API (tRPC router)

  - Create a `projects` router with `createProject`, `listProjects`, and `getProject` endpoints
  - Validate input with Zod and enforce server-side duplicate checks

- [ ] Wire TaskModal 'New Project' flow to backend
  - Call `createProject` from `src/components/TaskModal.tsx` when modal was opened via New Project
  - Use optimistic update and select the created project in the modal
- [ ] Change the Projects View
  - Each project is a squarer card object with a 'folder' icon to show that these are 'directories'. Then remove the checkboxes and descriptors.

## Medium priority

- [ ] Server-side validation & DB constraints

  - Enforce unique project names (case-insensitive) if appropriate
  - Return user-friendly errors for duplicates

- [ ] Add tests for project creation

  - Unit tests for the projects router (Vitest)
  - E2E test for the modal flow (Playwright or Testing Library + jsdom)

- [ ] UI polish and accessibility
  - Autofocus New Project input when opening the modal via New Project
  - Add proper `aria-*` attributes and keyboard handling

## Low / future

- [ ] Consider splitting `TaskModal` into `NewTaskModal` and `NewProjectModal`

  - Create an ADR describing pros/cons of duplication vs conditional logic

- [ ] Add CI workflows (typecheck, lint, tests)

- [ ] Add project tagging, permissions, and owner relationships

---

If you want, I can start working on the top item now: add the Prisma `Project` model and create the migration.
