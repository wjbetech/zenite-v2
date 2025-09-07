'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from './drawer';
import { ArrowLeft, Menu } from 'lucide-react';

type UISidebarProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
  width?: string; // tailwind width class like 'w-52'
  showHeader?: boolean;
};

/**
 * UISidebar: responsive sidebar.
 * - On md+ screens it renders a persistent <aside> with the provided children
 * - On small screens it renders a Drawer with a trigger and close button
 */
export function UISidebar({
  children,
  className,
  width = 'w-52',
  showHeader = true,
  ...props
}: UISidebarProps) {
  return (
    <>
      {/* Mobile: Drawer trigger + DrawerContent (visible only below md) */}
      <div className="md:hidden">
        <Drawer>
          <div className="px-3 py-2">
            <DrawerTrigger asChild>
              <button
                aria-label="Open sidebar"
                className="inline-flex items-center gap-2 rounded-md p-2 text-primary-content hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open sidebar</span>
              </button>
            </DrawerTrigger>
          </div>

          <DrawerContent className={cn('p-0', width)}>
            <div className="relative p-4 border-b" style={{ paddingTop: 0 }}>
              <DrawerClose asChild>
                <button
                  aria-label="Close sidebar"
                  className="absolute -translate-y-1/2 p-2 rounded hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5 text-primary" />
                </button>
              </DrawerClose>
              {showHeader && (
                <div className="flex items-center justify-center">
                  <div className="text-lg font-semibold">Menu</div>
                </div>
              )}
            </div>
            <div
              {...props}
              className={cn('flex flex-col p-4 bg-white', className)}
              style={{ height: 'calc(100vh - var(--nav-height))' }}
            >
              {children}
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop: fixed aside */}
      <aside
        {...props}
        className={cn(
          'hidden md:flex flex-col p-4 border-r border-gray-200 bg-base-200 fixed left-0 z-40',
          width,
          className,
        )}
        style={{ top: 'var(--nav-height)', height: 'calc(100vh - var(--nav-height))' }}
      >
        {children}
      </aside>
    </>
  );
}

export default UISidebar;
