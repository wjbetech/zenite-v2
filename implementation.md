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

- [ ] Set up Clerk
- [ ] Protect API routes
- [ ] Display login/logout UI
- [ ] Secure session storage

---

## 📁 Backend / API

- [ ] Initialize Drizzle ORM
- [ ] Set up PostgreSQL schema: users, tasks, projects, tags
- [ ] Create `db.ts` and `schema.ts` for Drizzle
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
- [ ] Project Sidebar
- [ ] Add/Edit Task Modal
- [ ] Navbar
- [ ] Settings Page
- [ ] Login/Register Page

---

## � Styles

- Use tones of green-emerald throughout the app to align with the zen visual language and create a calming, focused experience.

## �🌐 Pages

- [ ] `/dashboard`
- [ ] `/login`
- [ ] `/settings`
- [ ] `/404`

---

## 🚀 DevOps / Deployment

- [ ] Setup GitHub repo
- [ ] Deploy frontend to Vercel
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

## 🧠 Notes

- Consider use of `use-immer` with Zustand for deep state
- Consider optimistic updates with React Query for faster UI
- Think about "focus mode" — only show one task at a time
