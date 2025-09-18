# Immediate TODO (curate me)

NOTE: Development process — prioritize UI/UX work first, then backend production features, then polish/maintenance. Keep `TODO.md` current: review and update it on every commit/push and move completed items into `implementation.md`'s "Completed tasks" section. This policy is enforced by the team and documented in `implementation.md`.

This file contains a prioritized, actionable set of next tasks based on the current implementation notes in `implementation.md` and `project_stack.md`. Curate and reorder as you like — each item is intentionally scoped small so we can work in short PRs.

## High priority

These are the immediate actionable items. Completed items were moved to `implementation.md` under "Completed tasks".

- [ ] Fix the dailies view to reset daily

  - Ensure the Dailies view resets correctly once per day for users. Files to check: `src/app/dailies/page.tsx`, `src/components/DailiesClient.tsx`, `src/lib/utils.ts` (or where date logic lives), and `src/lib/taskStore.ts` / `src/lib/projectStore.ts` if dailies are persisted in state or DB. Acceptance criteria: (1) Dailies reset at local midnight (or configurable timezone) and UI reflects the reset without requiring a full page reload; (2) Completed/checked dailies are archived or cleared per current product spec; (3) Unit/integration tests cover reset logic and edge cases (timezone differences, daylight savings, offline/online reconnection). Implementation notes: compute next reset timestamp and schedule a client-side timer or revalidate on focus; if using server-side persisted streaks, add a last-seen date check and reset on fetch. Include test helpers to mock Date/time and tests for reset behavior.

- [ ] The dailies list should cap out at around 8 items and warn users when they try to create more with a tooltip on a disabled '+ Add Daily' button

  - Limit the visible/creatable dailies to ~8 items and show a user-facing tooltip when the '+ Add Daily' button is disabled. Files to change: `src/components/DailiesClient.tsx`, `src/components/TaskModal.tsx` or the component that renders the Add button, and `src/styles/` (tooltip styles). Acceptance criteria: (1) Users cannot create more than the configured hard cap (default to 8); (2) The '+ Add Daily' button becomes disabled at the cap and displays a tooltip on hover explaining why (e.g., 'Daily limit reached — archive or delete an existing daily to add a new one'); (3) Accessible behavior: tooltip readable by screen readers and keyboard focus. Implementation notes: enforce limit in both UI and API (if creation is server-backed) and write RTL tests that assert the button is disabled and the tooltip text appears.

- [ ] Fix the timer UI

  - Repair and polish the Timer UI to be consistent, responsive, and accessible. Files to check: `src/components/TimerWidget.tsx`, `src/components/Dashboard.tsx` (if it is used there), and global CSS / `tailwind.config.cjs`. Acceptance criteria: (1) Timer shows start/pause/reset controls and remaining time; (2) Visual states and animations don't shift layout unexpectedly; (3) Keyboard controls and ARIA attributes are present; (4) Timer integrates with dailies if a daily has an associated timer. Implementation notes: add tests for control behavior, simulate time progression in tests, and handle edge cases like background/visibility changes and system sleep.

- [ ] Enable handling some settings regarding the dailies (e.g. max number of dailies (5-10), whether the timer should show by default, etc)

  - Add user settings to configure dailies behavior: max number of dailies (range 5-10), whether the timer shows by default, and optionally daily reset timezone behavior. Files to update/add: `src/app/settings/page.tsx`, `src/components/Settings/` (create if needed), `src/lib/themeStore.ts` or create a new `src/lib/dailiesStore.ts` for persistence, and `src/lib/api.ts` if settings are persisted to backend. Acceptance criteria: (1) Settings UI accessible from `Settings` page; (2) Changes persist to local state or backend and immediately affect Dailies UI (e.g., changing max updates the Add button state); (3) Tests cover settings changes and persistence. Implementation notes: validate numeric ranges (5-10) and update TODO for server-side storage if we decide to persist settings in the DB.

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

- [ ] Build out drag and drop for the dailies page so that items can be reshuffled.
