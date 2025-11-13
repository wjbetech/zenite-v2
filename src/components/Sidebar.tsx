'use client';

import React from 'react';
import useProjectStore, { Project } from '../lib/projectStore';
import { projectSlug } from '../lib/utils';
import { truncatePreserveWords } from '../lib/string-utils';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
// import UISidebar from './ui/Sidebar';
// ...existing code...
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  Repeat2,
  Folder,
  Settings,
  FolderOpen,
  Star,
} from 'lucide-react';

export default function Sidebar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const SIDEBAR_KEY = 'zenite.sidebarCollapsed';

  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  const [mounted, setMounted] = React.useState<boolean>(false);
  const pathname = usePathname();

  const projects = useProjectStore((s) => s.projects);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [projectsOpen, setProjectsOpen] = React.useState<boolean>(
    !!pathname && pathname.startsWith('/projects'),
  );

  const { user } = useUser() as { user?: { id?: string } };
  const effectiveLoggedIn = isLoggedIn ?? !!user;
  const showSidebar = true;

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(SIDEBAR_KEY);
      if (raw !== null) setCollapsed(raw === 'true');
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    // mark mounted on the client to allow client-only content to render
    setMounted(true);
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // Today removed — tasks for today are shown on the Dashboard
    { href: '/dailies', label: 'Dailies', icon: Repeat2 },
    { href: '/projects', label: 'Projects', icon: Folder },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  if (!showSidebar) return null;

  const sidebarWidth = collapsed ? '64px' : '228px';

  return (
    <>
      <aside
        className={`sidebar fixed left-0 z-40 overflow-x-hidden`}
        style={{
          top: 'var(--nav-height)',
          height: 'calc(100vh - var(--nav-height))',
          width: sidebarWidth,
          // expose variable so layout can adapt
          ...({ ['--sidebar-width']: sidebarWidth } as React.CSSProperties),
        }}
      >
        {/* sync the visible sidebar width to the document root so layout can read it */}
        <SyncSidebarWidth width={sidebarWidth} />
        <div className="flex flex-col h-full text-neutral">
          {/* header / collapse toggle */}
          <div className="flex items-center justify-start p-2">
            <button
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed((s) => !s)}
              className="btn btn-square btn-ghost btn-icon"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-neutral" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-neutral" />
              )}
            </button>
          </div>

          {/* nav area: vertically centered container but left-aligned items */}
          <div className="flex-1 flex flex-col p-2">
            <nav className="flex flex-col gap-2 items-start w-full">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  !!pathname && (pathname === item.href || pathname.startsWith(item.href + '/'));
                // Render a consistent DOM shape regardless of auth state to avoid hydration mismatches.
                // Use visual/interactive attributes to reflect logged-in state.
                const disabled = !effectiveLoggedIn;
                return (
                  <div key={item.href} className="w-full">
                    <div
                      className={`flex items-center gap-3 rounded ${
                        item.href === '/projects' ? 'px-2 py-1.5' : 'px-2 py-2'
                      } ${isActive ? 'bg-success-content/20' : 'hover:bg-base-300'} ${
                        collapsed ? 'justify-center w-full' : 'justify-between w-full'
                      }`}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 ${
                          collapsed ? 'justify-center w-full' : 'flex-1 min-w-0'
                        } ${disabled ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
                        aria-disabled={disabled}
                      >
                        <div className="w-6 h-6 flex items-center justify-center text-neutral">
                          <Icon className="w-5 h-5" />
                        </div>
                        {!collapsed && <span>{item.label}</span>}
                      </Link>

                      {/* Projects toggle chevron (still only shown when not collapsed) */}
                      {item.href === '/projects' && !collapsed && (
                        <button
                          aria-expanded={projectsOpen}
                          aria-controls="sidebar-projects"
                          onClick={() => setProjectsOpen((s) => !s)}
                          className="btn btn-ghost btn-square btn-xs btn-icon"
                          title={projectsOpen ? 'Collapse projects' : 'Expand projects'}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              projectsOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* If this is the Projects nav item, render the nested project links */}
                    {item.href === '/projects' && !collapsed && (
                      <div
                        id="sidebar-projects"
                        className={`ml-3 mt-1 w-full pr-3 overflow-hidden origin-top transition-[max-height,opacity,transform] duration-200 ease-out ${
                          projectsOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                        }`}
                        style={{ maxHeight: projectsOpen ? '20rem' : 0 }}
                        aria-hidden={!projectsOpen}
                      >
                        <div
                          className="flex flex-col gap-1 overflow-auto w-full"
                          style={{ maxHeight: '20rem' }}
                        >
                          {!mounted ? (
                            // Render a stable placeholder on the server and until hydration completes.
                            <div className="text-xs text-gray-500">No projects yet</div>
                          ) : projects.length === 0 ? (
                            <div className="text-xs text-gray-500">No projects yet</div>
                          ) : (
                            projects
                              .slice()
                              .sort(
                                (a: Project, b: Project) =>
                                  (b.starred ? 1 : 0) - (a.starred ? 1 : 0),
                              )
                              .map((p: Project) => {
                                const slug = projectSlug(p.name ?? '');
                                const projectPath = `/projects/${slug}`;
                                const isActiveProject = pathname === projectPath;
                                return (
                                  <div
                                    key={p.id}
                                    className={`flex items-center justify-between gap-2 px-2 py-2 rounded ${
                                      isActiveProject
                                        ? 'bg-success-content/20'
                                        : 'hover:bg-base-300'
                                    }`}
                                  >
                                    <Link
                                      href={projectPath}
                                      className="text-sm truncate pr-2 flex-1 min-w-0"
                                    >
                                      <span className="inline-flex items-center gap-2">
                                        <FolderOpen className="w-4 h-4" />
                                        <span className="truncate" title={p.name ?? ''} aria-label={p.name ?? ''}>
                                          {truncatePreserveWords(p.name, 15)}
                                        </span>
                                      </span>
                                    </Link>
                                    <button
                                      aria-pressed={!!p.starred}
                                      onClick={() => updateProject(p.id, { starred: !p.starred })}
                                      className={`btn btn-ghost btn-xs btn-square btn-icon ${
                                        p.starred ? 'text-yellow-400' : 'text-neutral'
                                      }`}
                                      title={p.starred ? 'Unstar project' : 'Star project'}
                                    >
                                      <Star
                                        className="w-4 h-4"
                                        fill={p.starred ? 'currentColor' : 'none'}
                                        aria-hidden
                                      />
                                    </button>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
      {/* spacer so fixed-position sidebar doesn't overlap the flex content */}
      <div style={{ width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)' }} />
    </>
  );
}

function SyncSidebarWidth({ width }: { width: string }) {
  React.useEffect(() => {
    try {
      document.documentElement.style.setProperty('--sidebar-width', width);
      return () => {
        document.documentElement.style.removeProperty('--sidebar-width');
      };
    } catch {
      // ignore
    }
  }, [width]);
  return null;
}
