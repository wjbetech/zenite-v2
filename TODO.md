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
- [x] Wire TaskModal 'New Project' flow to backend
- Call `createProject` from `src/components/TaskModal.tsx` when modal was opened via New Project
- Use optimistic update and select the created project in the modal
- NOTE: Implemented — `src/components/TaskModal.tsx` now creates projects (via `api.createProject` when remote DB enabled, otherwise via local store) and selects the created project; modal also supports creating a task alongside the project via a toggle.
- [ ] Change the Projects View
- [ ] Change the Projects View
- Each project is a squarer card object with a 'folder' icon to show that these are 'directories'. Then remove the checkboxes and descriptors.
- Restyle project cards to visually match `TaskCard.tsx` (card elevation, padding, typography). Remove any progress checkbox or click-to-update progress UI — projects are directories only.
- Project cards should display a folder icon and project name, and include a delete button (cursor-pointer) that opens a reusable confirm modal component.
- Layout: 3x3 grid on large screens; scrolling 2x2 on medium; scrolling 1x1 on mobile.
- Sidebar: add a Projects dropdown that shows the user's current tasks (max 10 tasks allowed in total). Only 5 tasks should be visible; the remainder scroll inside the dropdown. One task can be starred which pins it to the top of the dropdown list.
- The Sidebar Projects dropdown should open automatically when the Projects tab is active and close when inactive. Use `framer-motion` for open/close transitions.
- Implement a reusable `ConfirmModal` component for delete confirmations so it can be reused across the app.

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
