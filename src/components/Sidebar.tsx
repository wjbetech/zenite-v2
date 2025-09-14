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
  LayoutDashboard,
  Folder,
  Settings,
  Repeat2,
} from 'lucide-react';
import ProjectSidebar from './ProjectSidebar';
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

  // prefer Clerk user state when available (client-side). This lets the
  // sidebar enable items immediately after Clerk hydration without relying
  // on a server-provided boolean prop.
  const { user } = useUser();
  const effectiveLoggedIn = isLoggedIn || Boolean(user?.id);

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
    <aside
      className={`sidebar fixed left-0 z-40 bg-base-200`}
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
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded px-2 py-2 ${
                      isActive ? 'bg-success-content/20' : 'hover:bg-base-300'
                    } ${collapsed ? 'justify-center w-full' : 'w-full'}`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-neutral">
                      <Icon className="w-5 h-5" />
                    </div>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
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
          {/* show the projects list below the nav when expanded */}
          {!collapsed && effectiveLoggedIn && (
            <div className="mt-2 px-1">
              <ProjectSidebar className="w-full" />
            </div>
          )}
        </div>
      </div>
    </aside>
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
