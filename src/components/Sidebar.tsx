'use client';

import React from 'react';
import Link from 'next/link';
import UISidebar from './ui/Sidebar';
import { Button } from './ui/Button';
import { ChevronLeft, ChevronRight, Home, Folder, Settings } from 'lucide-react';

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
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/projects', label: 'Projects', icon: Folder },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const hideHeader = collapsed && !isLoggedIn;

  return (
    <UISidebar width={collapsed ? 'w-16' : 'w-52'} showHeader={!hideHeader}>
      <div className="flex flex-col gap-3 h-full">
        <div className="flex items-center justify-start pl-1 cursor-pointer">
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

        {/* menu always visible; greyed-out when user not logged in */}
        <nav className="flex flex-col gap-2">
          {nav.map((item) => {
            const Icon = item.icon;
            if (isLoggedIn) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded px-2 py-2 hover:bg-gray-100 ${
                    collapsed ? 'justify-center' : ''
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
                  collapsed ? 'justify-center' : ''
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

        {isLoggedIn ? (
          <>
            <div className="mt-4">
              <Link href="/login">
                <Button variant="ghost" className={`w-full ${collapsed ? 'px-1 py-1' : ''}`}>
                  {!collapsed ? 'Login' : 'L'}
                </Button>
              </Link>
              <Link href="/signup" className="mt-2 block">
                <Button variant="primary" className={`w-full ${collapsed ? 'px-1 py-1' : ''}`}>
                  {!collapsed ? 'Sign up' : '+'}
                </Button>
              </Link>
            </div>
          </>
        ) : (
          // when collapsed and not logged in we hide the header and auth buttons
          !hideHeader && (
            <div className="flex-1 flex flex-col justify-end mb-20">
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
          )
        )}
      </div>
    </UISidebar>
  );
}
