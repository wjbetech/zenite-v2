## 📌 Requested follow-ups (from user)

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
  - Documentation and `TODO.md` updated to reflect the change.

# 🧱 Implementation Plan for [App Name]

A modern, minimalistic productivity web app.

## 🔧 Tech Stack

- Frontend: Next.js + TypeScript + Tailwind + shadcn/ui
- Backend: tRPC + PostgreSQL + Drizzle ORM
- Auth: Clerk
- State: React Query + Zustand
- Deployment: Vercel + Railway

---

## � Philosophy

The main goal of this application is to boost users' productivity without making it feel like a chore. The product should be simple, pro-active, and intuitive: users must be able to quickly set up tasks, receive desktop reminders and timers, and tackle work with minimal friction.

Design principles:

- Keep interactions lightweight and easy — add/edit tasks in one or two steps.
- Be pro-active with sensible defaults, gentle nudges, and timely desktop reminders/timers.
- Make the UI intuitive so onboarding is immediate and configuration is optional.
- Respect users: non-intrusive notifications, clear controls, and privacy-first defaults.

## �📦 Core Features

- [ ] Create/Edit/Delete Tasks
- [ ] Projects & Tags
- [ ] Task Prioritization
- [ ] Due Dates & Reminders
- [ ] Search & Filter
- [ ] Drag and Drop UI (e.g. kanban or reordering)
- [ ] User Authentication
- [ ] User Settings / Preferences
- [ ] Offline Mode (nice-to-have)

---

## 🔐 Authentication

- [x] Set up Clerk (done 2025-09-03)
- [x] Protect API routes
- [x] Display login/logout UI
- [x] Secure session storage

---

## 📁 Backend / API

- [ ] Initialize Prisma ORM
- [ ] Set up PostgreSQL schema: users, tasks, projects, tags
- [ ] Create `db.ts` and `schema.ts` for Prisma
- [ ] Set up tRPC router structure
  - [ ] Task router
  - [ ] Project router
  - [ ] Tag router
- [ ] Input validation with Zod

---

## 💾 Database Schema (Drizzle)

- [ ] Users Table
- [ ] Tasks Table
- [ ] Projects Table
- [ ] Tags Table
- [ ] Migrations with Drizzle Kit

---

## 🖼️ Icons

- All icons in the app should be handled using [lucide icons](https://lucide.dev/) via the `lucide-react` package for consistency and modern SVG support.

## 🎨 UI Components

- [ ] Task Card
  - [ ] Task View
- [ ] Project Sidebar
  - NOTE: Sidebar should include a Projects dropdown that shows current tasks. The dropdown opens when Projects tab is active, closes when inactive, uses `framer-motion` for transitions, shows up to 10 tasks (5 visible, rest scrollable), and supports starring one task to pin it to the top.
  - Project cards should be restyled to match `TaskCard.tsx` visuals, use a folder icon, no progress checkbox, and support a delete action that triggers a reusable `ConfirmModal`.
- [ ] Add/Edit Task Modal
  - [O] Add
  - [ ] Edit
  - NOTE: The `TaskModal` has been extended to support creating projects and optionally creating a task alongside the project. A toggle controls whether task inputs are shown when opening the modal via the New Project flow.
- [O] Navbar
- [ ] Settings Page
- [ ] Login/Register Page
  - [O] Login
  - [ ] Register

---

## � Styles

- Use tones of green-emerald throughout the app to align with the zen visual language and create a calming, focused experience.

## �🌐 Pages

- [O] `/dashboard`
- [O] `/login`
- [ ] `/settings`
- [ ] `/404`

---

## 🚀 DevOps / Deployment

- [O] Setup GitHub repo
- [O] Deploy frontend to Vercel
- [ ] Connect PostgreSQL via Supabase or Railway
- [ ] Environment Variables
  - [ ] DATABASE_URL
  - [ ] AUTH_SECRET / CLERK_API_KEY
- [ ] Enable CI/CD (GitHub Actions)
- [ ] Error monitoring via Sentry or LogRocket

---

## 📈 Future Ideas

- [ ] Calendar sync (Google Calendar)
- [ ] Voice notes
- [ ] Collaboration (multi-user)
- [ ] Pomodoro timer / analytics
- [ ] Mobile PWA

---

## � Further Design Ideas

- [ ] Change the order of tasks in New/Today/This Week based on what current task is being done
- [ ] Refactor styles to use DaisyUI color themes (pastel/cupcake/nord)
- [ ] Grey out completed tasks
- [ ] Imminent tasks page should instead style tasks based on their imminence
- [ ] Completed tasks should automatically move to the bottom of the stack and they should be 'minimized', i.e. their card should become narrower vertically
- [ ] Add animations so that items move around smoothly
- [ ] Allow users to move tasks up/down in the Today and This Week panel
- [ ] Tasks in New should be sorted from newest at the top to oldest at the bottom
- [ ] Tasks in imminent should have timers and be sorted from most imminent at the top to least imminent at the b ottom

### DaisyUI Theme Settings

- Added a Settings page to pick daisyUI themes for light and dark modes. Selections are stored in localStorage under `zenite.daisy.light` and `zenite.daisy.dark`, and the active theme is applied to the document via the `data-theme` attribute. The `src/lib/themeStore.ts` exposes `setDaisyLight` and `setDaisyDark` to update and persist selections.
- [ ] Grey out completed tasks
- [ ] Imminent tasks page should instead style based on 'imminence'
- [ ] Completed tasks should automatically move towards the bottom of the stack
  - [ ] Completed tasks could 'minimize' themselves to further reduce their visibility
- [ ] Add animations so items move around smoothly

---

## 🧠 Notes

- Consider use of `use-immer` with Zustand for deep state
- Consider optimistic updates with React Query for faster UI
- Think about "focus mode" — only show one task at a time

---

## 📌 Requested follow-ups (from user)

These items were requested to be added to the implementation/TODO documentation and prioritized for follow-up work.

1. Change the border color of all buttons to be black

- Scope: Update global button styles so every primary/secondary/ghost button uses a black 1px border by default while keeping current background and hover behavior.
- Files likely affected: `src/styles/` (global CSS), `tailwind.config.cjs`, and components that override button styles (e.g., `src/components/*Button*.tsx`).
- Acceptance criteria: All buttons visually display a black border in both light and dark themes; snapshots for key components updated.

2. Fix the activity tracker so that it tracks for history and not only the current day

- Scope: Ensure activity recording persists daily history (multiple dates), not only the current day. Update backfill/migrations if needed.
- Files likely affected: `src/components/ActivityHeatmap.tsx`, `src/lib/api.ts`, `src/lib/utils.ts` (date normalization), and server-side activity logging endpoints/stores.
- Acceptance criteria: Heatmap and activity lists show historical activity across dates; tests validate history retrieval and rendering.

3. Fix the settings page to handle default settings for lots of the websites elements

- Scope: The Settings page should provide and persist sane defaults for theme, dailies caps, timer visibility, and other toggles. Provide fallbacks when backend settings are missing.
- Files likely affected: `src/app/settings/page.tsx`, `src/components/Settings/*`, `src/lib/themeStore.ts`, `src/lib/api.ts` (settings endpoints), and any store that persists settings.
- Acceptance criteria: Settings UI shows defaults when none are saved; changing settings updates behavior immediately and persists (localStorage or backend depending on config).

4. Double check that the dashboard components work

- Scope: Verify Dashboard components render correctly and are wired to the server, including `Dashboard.tsx`, `ActivityHeatmap`, `TimerWidget`, task buckets, and graphing components.
- Files likely affected: `src/components/Dashboard.tsx`, `src/components/ActivityHeatmap.tsx`, `src/components/TimerWidget.tsx`, `src/components/Dashboard/*` tests.
- Acceptance criteria: Manual smoke test (run dev server) shows dashboard with live data; unit tests for key components pass and snapshots updated if needed.

5. Create graphing/statistics for the Dashboard data

- Scope: Add a dashboard statistics area with graphs (e.g., activity over time, completed tasks per week, productivity heatmap). Choose a lightweight charting library (e.g., `chart.js` or `recharts`) and implement server endpoints to return aggregated stats.
- Files to add/update: `src/components/DashboardStats.tsx`, `src/lib/api.ts` (new endpoints such as `/api/stats/activity`), server aggregation helpers, and tests.
- Acceptance criteria: Charts render with realistic data; endpoints return aggregated metrics; both server and client have tests for aggregation logic and rendering.

6. Refactor `.no-border` helper into Tailwind utility classes

- Scope: Replace the global `.no-border` CSS opt-out with a semantic Tailwind utility (e.g., `btn-icon` or `no-border-icon`) implemented either via `@apply` or a small plugin/config in `tailwind.config.cjs`. The goal is to avoid global overrides and instead compose classes on icon-only buttons.
- Files likely affected: `src/app/globals.css`, `tailwind.config.cjs`, and components that use `.no-border` (e.g., `src/components/Sidebar.tsx`, `src/components/TaskCard.tsx`, `src/components/DailyTaskCard.tsx`).
- Acceptance criteria: The `.no-border` global rule is removed; icon-only buttons use the Tailwind utility consistently; visual parity remains the same and tests pass.

7. Restore the Projects / Settings sidebar gap

- Scope: The gap between the Projects link and the Settings item in the Sidebar should be restored (small vertical spacing), matching the project's nav spacing conventions. This is likely a spacing change in `src/components/Sidebar.tsx` and associated CSS/classes.
- Files likely affected: `src/components/Sidebar.tsx`, `src/components/__tests__/Sidebar.test.tsx` (update if tests expect a specific layout), and `src/styles/` if global spacing variables exist.
- Acceptance criteria: Sidebar shows a small gap (e.g., `mt-1` or `mb-2`) between Projects and Settings; tests that check DOM presence or layout continue to pass or are updated accordingly.

---

## ✅ Completed tasks

The following items were completed and moved from `TODO.md` on 2025-09-17 to keep the todo list focused on next actionable work.

- Implement Projects table & migration (Prisma)

  - Added `Project` model to `prisma/schema.prisma`, created & applied migration, and ran `prisma generate`.

- Add Projects API (tRPC router)

  - Created a `projects` router with `createProject`, `listProjects`, and `getProject` endpoints. Input validated with Zod and duplicate checks added.

- Wire TaskModal 'New Project' flow to backend

  - `src/components/TaskModal.tsx` now calls project creation (via API or local store), performs optimistic updates, and selects the created project. It supports creating a task alongside the project via a toggle.

- Change the Projects View

  - Project cards restyled and behavior updated (folder icon, project-only directories, delete via reusable `ConfirmModal`, responsive grid layout). Sidebar Projects dropdown added as specified (shows current tasks, opens when active, uses `framer-motion`).

- Activity refactor and heatmap

  - Refactored the Activity Heatmap and Dashboard activity wiring to normalize completion dates to local YYYY-MM-DD keys and added `ActivityHeatmap` tooltips and details. Guarded dev-only console diagnostics in `Dashboard.tsx` so tests/CI output remains clean.

- Tests: Dashboard Today/Week bucketing

  - Added `src/components/__tests__/Dashboard.buckets.test.tsx` covering Today and This Week bucketing (daily recurrence inclusion and 0-6 day range). Tests added and merged into `main` on 2025-09-22.

If you prefer a different date or more granular notes per task, I can expand these entries.

---

## 🛠 Development process (team policy)

This repository follows a small, repeatable process to keep work focused and production-ready. Documented here so collaborators and CI checks can reference it.

1. Prioritize the next work in this order: UI/UX development for immediate features → key backend functionality required for production → polish, accessibility, and maintenance.
2. Use `TODO.md` as the single source of current tasks. Keep it up to date: every push should only include changes that preserve or update `TODO.md` to reflect current priorities (add, complete, reorder). Small commits still update `TODO.md`.
3. When tasks are finished, mark them completed in `TODO.md` and move the completed checklist items into `implementation.md` under "Completed tasks" with a short date/note.

Follow these rules during development and in pull requests. If you'd like, I can add a lightweight Git commit hook or GitHub Action to remind authors to update `TODO.md` on PR creation.

## 📌 Followups added 2025-09-29

1. Ensure activity tracker persists daily history

- Scope: Make the activity tracker persist per-day statistics long-term (not just for the current day). Normalize date keys to YYYY-MM-DD server- and client-side.
- Files: `src/components/ActivityHeatmap.tsx`, `src/components/ActivityTracker.tsx`, `src/lib/api.ts`, server activity endpoints.
- Acceptance criteria: multi-day activity can be recorded and retrieved; heatmap and history views render days spanning months; tests cover timezone normalization.

2. Bind activity stats to Dashboard charts

- Scope: Add server endpoints that aggregate per-user activity (daily/weekly/monthly) and wire `DashboardStats` to render charts using that data.
- Files: `src/app/api/stats/*`, `src/components/DashboardStats.tsx`, `src/components/Dashboard.tsx`.
- Acceptance criteria: aggregated endpoints exist and charts render with realistic data; tests for aggregation and chart wiring.

3. Sidebar truncation for project/task names

- Scope: Fix the Sidebar so long project/task names truncate with ellipsis before the star icon and preserve a `title` attribute for full text.
- Files: `src/components/Sidebar.tsx`, `src/components/ProjectSidebar.tsx`.
- Acceptance criteria: UI truncates long names without layout breakage; tooltip or `title` exposes full name; unit tests added.

4. Dashboard tab backgrounds

- Scope: Add `bg-base-100` (and optionally `border-base-content`) to Dashboard tabs (New / Today / This Week) to improve contrast and separation.
- Files: `src/components/Dashboard.tsx`, `src/components/DashboardTabs.tsx`.
- Acceptance criteria: tabs render with `bg-base-100`, keyboard navigation remains accessible, tests updated.

5. Evaluate Dashboard refactor to multi-page Projects-style

- Scope: Consider refactoring the dashboard into a Projects-style dropdown with multiple pages (Tasks, Stats, Activity). Produce an ADR and a small prototype.
- Files (proposal): `src/components/Dashboard/*`, routing under `src/app/dashboard/*`.
- Acceptance criteria: ADR produced with migration plan; prototype demonstrates feasibility.
