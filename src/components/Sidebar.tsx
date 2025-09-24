'use client';

import React from 'react';
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
  Folder,
  FolderOpen,
  Settings,
  Repeat2,
} from 'lucide-react';
import useProjectStore from '../lib/projectStore';
import { Star } from 'lucide-react';
import { useEffect } from 'react';

const SIDEBAR_KEY = 'zenite.sidebarCollapsed';

type SidebarProps = {
  isLoggedIn?: boolean;
};

export default function Sidebar({ isLoggedIn = false }: SidebarProps) {
  const pathname = usePathname();
  const allowedPrefixes = ['/dashboard', '/dailies', '/projects', '/settings'];
  const showSidebar = Boolean(
    pathname &&
      allowedPrefixes.some(
        (p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p),
      ),
  );

  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  const [projectsOpen, setProjectsOpen] = React.useState<boolean>(
    Boolean(pathname && pathname.startsWith('/projects')),
  );

  // prefer Clerk user state when available (client-side). This lets the
  // sidebar enable items immediately after Clerk hydration without relying
  // on a server-provided boolean prop.
  const { user } = useUser();
  const effectiveLoggedIn = isLoggedIn || Boolean(user?.id);

  const projects = useProjectStore((s) => s.projects);
  const updateProject = useProjectStore((s) => s.updateProject);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(SIDEBAR_KEY);
      if (raw !== null) setCollapsed(raw === 'true');
    } catch {
      // ignore
    }
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

  const sidebarWidth = collapsed ? '64px' : '208px';

  return (
    <>
      <aside
        className={`sidebar fixed left-0 z-40 bg-base-200 overflow-x-hidden`}
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
              className="btn btn-square btn-ghost"
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
                if (effectiveLoggedIn) {
                  return (
                    <React.Fragment key={item.href}>
                      <div
                        className={`flex items-center gap-3 rounded ${
                          item.href === '/projects' ? 'px-1 py-1.5' : 'px-2 py-2'
                        } ${isActive ? 'bg-success-content/20' : 'hover:bg-base-300'} ${
                          collapsed ? 'justify-center w-full' : 'justify-between w-full'
                        }`}
                      >
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 ${
                            collapsed ? 'justify-center w-full' : 'flex-1 min-w-0'
                          }`}
                        >
                          <div className="w-6 h-6 flex items-center justify-center text-neutral">
                            <Icon className="w-5 h-5" />
                          </div>
                          {!collapsed && <span>{item.label}</span>}
                        </Link>

                        {/* Projects toggle chevron */}
                        {item.href === '/projects' && !collapsed && (
                          <button
                            aria-expanded={projectsOpen}
                            aria-controls="sidebar-projects"
                            onClick={() => setProjectsOpen((s) => !s)}
                            className="btn btn-ghost btn-square btn-xs"
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
                          className={`ml-3 mt-0 w-full pr-3 overflow-hidden origin-top transition-[max-height,opacity,transform] duration-200 ease-out ${
                            projectsOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                          }`}
                          style={{ maxHeight: projectsOpen ? '20rem' : 0 }}
                          aria-hidden={!projectsOpen}
                        >
                          <div
                            className="flex flex-col gap-1 overflow-auto w-full"
                            style={{ maxHeight: '20rem' }}
                          >
                            {projects.length === 0 && (
                              <div className="text-xs text-gray-500">No projects yet</div>
                            )}
                            {projects
                              .slice()
                              .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0))
                              .map((p) => (
                                <div
                                  key={p.id}
                                  className={`flex items-center justify-between gap-2 px-2 py-2 rounded ${
                                    pathname === `/projects/${p.id}`
                                      ? 'bg-success-content/20'
                                      : 'hover:bg-base-300'
                                  }`}
                                >
                                  <Link
                                    href={`/projects/${p.id}`}
                                    className="text-sm truncate pr-2 flex-1 min-w-0"
                                  >
                                    <span className="inline-flex items-center gap-2">
                                      <FolderOpen className="w-4 h-4" />
                                      <span className="truncate">{p.name}</span>
                                    </span>
                                  </Link>
                                  <button
                                    aria-pressed={!!p.starred}
                                    onClick={() => updateProject(p.id, { starred: !p.starred })}
                                    className={`btn btn-ghost btn-xs btn-square ${
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
                              ))}
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                }

                // not logged in: show disabled/greyed item
                return (
                  <div
                    key={item.href}
                    role="link"
                    aria-disabled="true"
                    tabIndex={-1}
                    className={`flex items-center gap-3 rounded px-2 py-2 text-neutral cursor-not-allowed ${
                      collapsed ? 'justify-center w-full' : 'w-full'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-neutral">
                      <Icon className="w-5 h-5" />
                    </div>
                    {!collapsed && <span>{item.label}</span>}
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
  useEffect(() => {
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
