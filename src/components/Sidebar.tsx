'use client';

import React from 'react';
import Link from 'next/link';
import UISidebar from './ui/Sidebar';
import { Button } from './ui/Button';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Folder,
  Settings,
  Calendar,
  Repeat2,
} from 'lucide-react';

const SIDEBAR_KEY = 'zenite.sidebarCollapsed';

type SidebarProps = {
  isLoggedIn?: boolean;
};

export default function Sidebar({ isLoggedIn = false }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(SIDEBAR_KEY);
      if (raw !== null) setCollapsed(raw === 'true');
    } catch (e) {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    } catch (e) {
      /* ignore */
    }
  }, [collapsed]);

  const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/today', label: 'Today', icon: Calendar },
    { href: '/dailies', label: 'Dailies', icon: Repeat2 },
    { href: '/projects', label: 'Projects', icon: Folder },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const hideHeader = collapsed && !isLoggedIn;

  return (
    <UISidebar width={collapsed ? 'w-16' : 'w-52'} showHeader={!hideHeader}>
      <div className="flex flex-col h-full">
        {/* header / collapse toggle */}
        <div className="flex items-center justify-start pl-1 py-2">
          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((s) => !s)}
            className="p-1 rounded hover:bg-gray-100 cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* nav area: vertically centered container but left-aligned items */}
        <div className="flex-1 flex flex-col justify-center">
          <nav className="flex flex-col gap-2 items-start w-full">
            {nav.map((item) => {
              const Icon = item.icon;
              if (isLoggedIn) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded px-2 py-2 hover:bg-gray-100 ${
                      collapsed ? 'justify-center w-full' : 'w-full'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-gray-700">
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
                  className={`flex items-center gap-3 rounded px-2 py-2 text-gray-400 cursor-not-allowed ${
                    collapsed ? 'justify-center w-full' : 'w-full'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center text-gray-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  {!collapsed && <span>{item.label}</span>}
                </div>
              );
            })}
          </nav>
        </div>

        {/* footer: auth buttons anchored to bottom */}
        {!hideHeader && (
          <div className="mt-auto px-2 pb-4 w-full">
            {isLoggedIn ? (
              <div className="space-y-2">
                <Link href="/login">
                  <Button variant="ghost" className={`w-full ${collapsed ? 'px-1 py-1' : ''}`}>
                    {!collapsed ? 'Login' : 'L'}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" className={`w-full ${collapsed ? 'px-1 py-1' : ''}`}>
                    {!collapsed ? 'Sign up' : '+'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                <h5 className="text-gray-400 mb-2 text-center">You are not logged in!</h5>
                <div className="flex flex-col gap-4 w-full">
                  <Link href="/login" className="w-full">
                    <Button variant="default" className={`w-full ${collapsed ? 'px-1 py-1' : ''}`}>
                      {!collapsed ? 'Login' : 'L'}
                    </Button>
                  </Link>
                  <Link href="/signup" className="w-full">
                    <Button variant="primary" className={`w-full ${collapsed ? 'px-1 py-1' : ''}`}>
                      {!collapsed ? 'Sign up' : '+'}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </UISidebar>
  );
}
