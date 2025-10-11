import React from 'react';
import { Activity, CalendarCheck2, FolderKanban, ShieldCheck, Sparkles } from 'lucide-react';

const highlightCards = [
  {
    title: 'Daily flow without chaos',
    description:
      'Capture dailies, recurring rituals, and quick wins in a single timeline that gently nudges you toward focus.',
    Icon: CalendarCheck2,
    accent: 'from-emerald-500/80 to-teal-500/60',
  },
  {
    title: 'Projects with context built in',
    description:
      'Break work into lightweight projects, track progress snapshots, and surface the next most impactful task instantly.',
    Icon: FolderKanban,
    accent: 'from-sky-500/80 to-indigo-500/60',
  },
  {
    title: 'Signals over noise',
    description:
      'Personalized heatmaps and activity trends help you stay consistent without overwhelming dashboards or vanity charts.',
    Icon: Activity,
    accent: 'from-amber-500/80 to-orange-500/60',
  },
];

const workflowMilestones = [
  {
    title: 'Plan your day with intention',
    detail:
      'Start each morning reviewing the daily queue. Snooze or fast-track items with one gesture.',
  },
  {
    title: 'Progress in focused cycles',
    detail:
      'Sprint through 25-minute focus blocks with ambient timers, quick notes, and lightweight check-ins.',
  },
  {
    title: 'Reflect & adapt automatically',
    detail:
      'Zenite snapshots your momentum, showing streaks, capacity, and what deserves attention next.',
  },
];

export default function HomeFeatures() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="absolute inset-0">
        <div className="pointer-events-none absolute inset-x-1/4 -top-24 h-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-1/3 top-64 h-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col justify-center px-0 py-24">
        <div className="grid w-full items-center gap-16 px-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.28em] text-emerald-200">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Designed for intentional teams
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">
                Meaningful work stays organized, deliberate, and calm.
              </h2>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                Zenite gives remote teams and founders a single canvas to choreograph dailies,
                projects, and long-term bets. Prioritize with clarity, stay in flow, and surface the
                insights that keep you moving.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {highlightCards.map(({ title, description, Icon, accent }) => (
                <article
                  key={title}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.65)] transition-transform duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  <div
                    className={`absolute -right-16 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-gradient-to-br ${accent} blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-60`}
                  />
                  <Icon className="relative h-9 w-9 text-emerald-200" aria-hidden="true" />
                  <h3 className="relative mt-4 text-lg font-semibold text-white">{title}</h3>
                  <p className="relative mt-2 text-sm text-slate-300">{description}</p>
                </article>
              ))}
            </div>

            <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.32em] text-emerald-200">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                Workflow snapshots
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {workflowMilestones.map(({ title, detail }, index) => (
                  <div key={title} className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-medium text-white">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold">
                        {index + 1}
                      </span>
                      {title}
                    </div>
                    <p className="text-sm text-slate-300">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-[0_35px_120px_-35px_rgba(45,212,191,0.65)] backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-slate-900/40 to-slate-900" />
              <div className="relative flex flex-col gap-8 p-8 text-sm text-slate-200">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-emerald-200">
                    Live preview
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    Plan your week at a glance
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Tasks, projects, and rituals sit side-by-side. Drag to reschedule, assign
                    teammates, or promote a task into the focus queue with one click.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">
                        Focus Sprint
                      </p>
                      <p className="text-sm text-white">Write launch announcement</p>
                    </div>
                    <div className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-100">
                      Due today
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Project</p>
                      <p className="text-sm text-white">Orchestrate onboarding revamp</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="h-2 w-2 rounded-full bg-emerald-300" />
                      68% done
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                      Momentum snapshot
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="text-3xl font-semibold text-white">12</div>
                      <div className="text-sm text-slate-300">
                        day streak · consistent mornings · 4 focus sessions completed this week
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-emerald-100">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  Privacy-first architecture with encrypted Clerk auth and per-owner data
                  boundaries.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-6 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-200">200+ teams</span> run their daily rituals
            on Zenite.
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-full border border-white/10 px-4 py-2">
              API-first automations
            </div>
            <div className="rounded-full border border-white/10 px-4 py-2">
              SOC2-ready infrastructure
            </div>
            <div className="rounded-full border border-white/10 px-4 py-2">24h human support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
