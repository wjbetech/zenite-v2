4. Home button & header polish (added 2025-09-29)

- Scope: Polish the home route (`/`) by applying consistent border styling to the call-to-action buttons, updating the 'To Dashboard' icon to be thematically accurate, and showing the user's Google profile image in the header when available.
- Files to update: `src/app/page.tsx` (home), `src/components/Header.tsx` or wherever the logged-in user display is rendered, and any small helper components for the home CTA (e.g., `src/components/HomeButton.tsx` if present). Also update tests for home route render.
- Acceptance criteria:
  - The 'To Dashboard', 'Sign in', and 'Sign out' buttons on `/` include `border-2 border-base-content` (or `border-on` combined with `border-base-content` where appropriate) so they visually match other bordered controls.
  - The 'To Dashboard' CTA uses a more semantically appropriate icon (suggestion: `Home`, `Grid`, or `ArrowRightSquare` from `lucide-react`) and the icon aligns correctly with button text.
  - If the user is logged in via Google, the header shows the Google profile image avatar (from OAuth profile data). If no image is available, show a fallback avatar with initials.
  - Unit/visual tests updated: ensure home CTA buttons render with the new border classes and header shows profile image when present.

## 📌 New Project Modal Updates

8. Dashboard — New Project modal: optional project-only flow

- Scope: Update the Dashboard New Project flow (currently implemented in `TaskModal.tsx` / Dashboard modal wiring) so that creating a new project can optionally be done without simultaneously creating a task. The modal should expose a toggle (or choose the flow via separate "Create only project" button) that will only create the Project when selected and skip task creation. This helps users who want to add project containers without an immediate starter task.
- Files to update: `src/components/TaskModal.tsx` (split or add option), `src/app/dashboard/page.tsx`, `src/lib/api.ts` (ensure `POST /api/projects` handles a project-only payload), and any client stores that expect both objects to be created together (e.g., `projectStore.ts`, `taskStore.ts`). If the combined creation flow remains supported, ensure the client performs the createProject -> createTask flow atomically (server-side transaction preferred).
- Acceptance criteria:
  - The New Project modal includes a clear option to create a project without creating a task (toggle or distinct UI path).
  - When the project-only option is selected, the client sends a `POST /api/projects` call and does NOT create a task; the new project appears in the sidebar and `/projects` view immediately after creation.
  - The combined (project + task) flow still works unchanged when the user chooses it; tasks created with a new project are correctly linked to the new project's id.
  - Unit tests added for modal behavior and an API test for project-only creation.
  - Documentation and `implementation.md` updated to reflect the change.

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

- [ ] Dashboard: New Project modal should accept a description

  - When a user creates a project from the Dashboard 'New Project' modal, the modal must include a multiline "Description" field. Files to update: `src/components/TaskModal.tsx` (or wherever the Dashboard new-project modal lives), `src/app/dashboard/page.tsx`, and `src/lib/api.ts` to accept and forward a description on create. Acceptance criteria: (1) The modal shows a labeled Description input (textarea); (2) Description is sent to the backend `POST /api/projects` call and persisted on the Project model; (3) The newly created project's description is visible on the project details page and editable later; (4) Unit tests validate the create flow and the API payload; (5) Accessible labels and autofocus behavior for the project name input remain intact.

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

- [ ] Auto-link tasks created together with a new project

  - If a user creates a new task at the same time they're creating a new project (for example, via the Dashboard flow where the New Project modal also creates a starter task), the task should be created and assigned to the newly created project in a single atomic flow. Implementation notes: (1) Client should POST to a combined endpoint or perform a server-side transaction that creates the Project then creates any Task(s) referencing the new project's id; (2) If using separate calls, ensure the client waits for the Project create response and uses its id when creating the Task(s); (3) Rollback semantics or error handling: if task creation fails after project creation, surface an error and allow retry or cleanup; (4) Files to inspect/update: `src/components/TaskModal.tsx`, `src/lib/api.ts`, `src/pages/api/projects/route.ts` (or `src/app/api/projects/route.ts`), and `src/app/dashboard/page.tsx`. Acceptance criteria: newly-created tasks appear under the project immediately; no orphan tasks are left in the default project/state when the combined flow is used; tests validate the combined creation flow and error cases.

## Low / future

- [ ] Consider splitting `TaskModal` into `NewTaskModal` and `NewProjectModal`

  - Create an ADR describing pros/cons of duplication vs conditional logic

- [ ] Add CI workflows (typecheck, lint, tests)

- [ ] Add project tagging, permissions, and owner relationships

---

## User-requested items (added 2025-09-28)

- [ ] Change the border color of all buttons to be black

  - Update global button styles so primary/secondary/ghost buttons use a 1px black border by default. Update snapshots for affected components.

- [ ] Fix the activity tracker to persist history (not only current day)

  - Ensure activity data is recorded and returned for historical dates. Update backend aggregation and heatmap rendering.

- [ ] Fix Settings page defaults handling

  - Provide and persist sane defaults for theme, dailies cap, timer visibility, and other toggles. Gracefully handle missing backend settings by falling back to client defaults.

- [ ] Verify Dashboard components

  - Smoke test and add/adjust unit tests for Dashboard components: `ActivityHeatmap`, `TimerWidget`, task buckets, and `DashboardStats` placeholder.

- [ ] Create dashboard graphing/statistics

  - Add `DashboardStats` component and server endpoints to provide aggregated metrics (activity over time, completed tasks per period). Evaluate and add a lightweight charting library and tests for aggregations.

- [ ] Refactor `.no-border` to Tailwind utility classes

  - Replace the global `.no-border` CSS rule with a semantic Tailwind utility (e.g., `btn-icon` or `btn-no-border`) using `@apply` or a small `tailwind.config.cjs` plugin. Update components using `.no-border` to the new utility.

- [ ] Restore Projects/Settings sidebar gap

  - Add a small vertical gap between Projects and Settings nav items in the Sidebar. Update tests if they rely on specific DOM structure or spacing.

If you want, I can start working on the top item now: add the Prisma `Project` model and create the migration.

## Added 2025-09-29

- [ ] Ensure activity tracker persists daily history

  - Scope: Make the activity tracker persist per-day statistics long-term (not only current-day). Normalize date keys to YYYY-MM-DD and ensure server storage exposes historical ranges.
  - Files: `src/components/ActivityHeatmap.tsx`, `src/components/ActivityTracker.tsx`, `src/lib/api.ts`, server activity endpoints.
  - Acceptance criteria: Heatmap and history views render multi-day data; tests added for retrieval across ranges and timezone handling.

- [ ] Bind activity stats to Dashboard charts

  - Scope: Provide aggregated endpoints (daily/weekly/monthly) for per-user activity and render charts in `DashboardStats`.
  - Files: `src/app/api/stats/*`, `src/components/DashboardStats.tsx`, `src/components/Dashboard.tsx`.
  - Acceptance criteria: endpoints and chart components exist; tests validate aggregation and rendering.

- [ ] Sidebar truncation for project/task names

  - Scope: Truncate long names with ellipsis before icons and provide a `title` for full text.
  - Files: `src/components/Sidebar.tsx`, `src/components/ProjectSidebar.tsx`.
  - Acceptance criteria: names truncate without layout break; tooltip/title shows full text; unit tests added.

- [ ] Dashboard tabs: add `bg-base-100` backgrounds

  - Scope: Apply `bg-base-100` to the Dashboard tabs controlling which task view is shown to visually separate them.
  - Files: `src/components/Dashboard.tsx`, `src/components/DashboardTabs.tsx`.
  - Acceptance criteria: tabs use `bg-base-100`, remain keyboard accessible, tests updated.

- [ ] Consider refactor: Dashboard -> Projects-dropdown + multi-page

  - Scope: Evaluate and prototype refactoring Dashboard into a Projects-style dropdown with multiple pages (Tasks, Stats, Activity). Produce an ADR and prototype.
  - Files (proposal): `src/components/Dashboard/*`, `src/app/dashboard/*`.
  - Acceptance criteria: ADR and prototype; follow-up tickets created if agreed.

- [ ] Build out drag and drop for the dailies page so that items can be reshuffled.

## Avatar / Header TODO

- [ ] Refactor Clerk avatar menu to use DaisyUI components

  - Scope: Replace the custom avatar/menu markup in `src/components/Navbar.tsx` with DaisyUI dropdown/menu primitives where possible so the profile menu inherits theme styles and behavior. Improve keyboard accessibility (Escape to close, arrow navigation) and ensure menu items link to Profile/Settings and sign-out via Clerk.
  - Files: `src/components/Navbar.tsx`, `src/components/__tests__/Navbar.test.tsx` (update/add tests), and any small helper components introduced for menu items.
  - Acceptance criteria:
    - Avatar menu uses DaisyUI `dropdown` / `menu` classes and looks consistent across DaisyUI themes.
    - Menu is keyboard accessible and closes when clicking outside or pressing Escape.
    - Sign out still triggers Clerk sign out and no runtime serialization issues are introduced.
    - Tests added/updated to assert menu presence, ARIA attributes, and interaction.

### New followups (added 2025-09-30)

- [ ] Add real `/profile` route and wire avatar menu

  - Scope: Make the 'Profile' menu item in the Navbar's avatar dropdown navigate to `/profile` using client-side navigation. The dropdown should close on navigation.
  - Files to update: `src/components/Navbar.tsx`, add `src/app/profile/page.tsx`.
  - Acceptance criteria:
    - Clicking Profile navigates user client-side to `/profile`.
    - The dropdown closes on navigation.
    - Tests updated to mock/verify navigation.

- [ ] Implement Profile page (Clerk + DB integration)

  - Scope: Create a Profile page that displays Clerk user info and related app data (recent projects/tasks). Protect the page so only signed-in users can view it. Provide loading and empty states.
  - Files to add/update: `src/app/profile/page.tsx`, `src/app/profile/components/*`, server API route(s) to fetch user DB data.
  - Acceptance criteria:
    - Profile header shows avatar (with initials fallback), name, and email.
    - Recent projects and recent tasks are displayed (or an empty state CTA).
    - Non-signed-in users are redirected to login or shown a Sign in CTA.
    - Unit tests added for the header and a mocked data fetch integration test for the page.

---

## Recent progress (2025-09-22)

- Merged `feature/activity-refactor` into `main` with the following highlights:
  - Activity heatmap refactor and tooltip/details wiring.
  - Guarded dev console diagnostics in `Dashboard.tsx` to keep test/CI output clean.
  - Added `src/components/__tests__/Dashboard.buckets.test.tsx` to validate Today and This Week bucketing logic.
  - Removed unused test locals and updated Sidebar spacing for Projects (aligns nested items with other nav items).

All tests pass locally after these changes.

## Suggested next steps

- Address `zustand` deprecation warnings by switching store files to the named `create` export.
- Add a small visual regression/smoke test for `Sidebar` to assert padding/spacing for the Projects item.
- Add CI steps (typecheck, lint, tests) so these regressions are caught in PRs.
