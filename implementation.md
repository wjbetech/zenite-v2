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

If you prefer a different date or more granular notes per task, I can expand these entries.

---

## 🛠 Development process (team policy)

This repository follows a small, repeatable process to keep work focused and production-ready. Documented here so collaborators and CI checks can reference it.

1. Prioritize the next work in this order: UI/UX development for immediate features → key backend functionality required for production → polish, accessibility, and maintenance.
2. Use `TODO.md` as the single source of current tasks. Keep it up to date: every push should only include changes that preserve or update `TODO.md` to reflect current priorities (add, complete, reorder). Small commits still update `TODO.md`.
3. When tasks are finished, mark them completed in `TODO.md` and move the completed checklist items into `implementation.md` under "Completed tasks" with a short date/note.

Follow these rules during development and in pull requests. If you'd like, I can add a lightweight Git commit hook or GitHub Action to remind authors to update `TODO.md` on PR creation.
