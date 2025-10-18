'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type View = 'imminent' | 'new' | 'today' | 'week';

type TabDef = { id: View; show: boolean; label: string; minClass: string };

export default function TabsBox(props: {
  tabsRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onScroll: (e: React.UIEvent) => void;
  scrollTabsBy: (n: number) => void;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  didDrag: React.MutableRefObject<boolean>;
  tabDefs: TabDef[];
  activeView: View;
  setView: (v: View) => void;
}) {
  const {
    tabsRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onScroll,
    scrollTabsBy,
    canScrollLeft,
    canScrollRight,
    didDrag,
    tabDefs,
    activeView,
    setView,
  } = props;

  return (
    <div className="mb-4">
      <div className="mx-auto w-full">
        <div className="tabs tabs-box bg-base-300 w-full flex items-center">
          <div className="flex-none px-1">
            <button
              type="button"
              aria-label="Scroll tabs left"
              onClick={() => scrollTabsBy(-220)}
              className="btn btn-ghost btn-sm pointer-events-auto h-8 w-8 p-0 flex items-center justify-center text-base-content"
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={tabsRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onScroll={onScroll}
            className="overflow-x-auto no-scrollbar flex items-center flex-nowrap whitespace-nowrap flex-1 px-3"
            role="tablist"
            aria-label="Task view tabs"
            style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' as const }}
          >
            {tabDefs
              .filter((t) => t.show)
              .map((t, i, arr) => {
                const isActive = activeView === t.id;
                const isLast = i === arr.length - 1;
                return (
                  <React.Fragment key={t.id}>
                    <div
                      className={`flex items-center flex-none min-w-full md:flex-1 md:min-w-0 ${t.minClass}`}
                      style={{ scrollSnapAlign: 'start' as const }}
                    >
                      <button
                        role="tab"
                        aria-selected={isActive}
                        onClick={(e) => {
                          if (didDrag.current) {
                            e.stopPropagation();
                            e.preventDefault();
                            return;
                          }
                          setView(t.id);
                        }}
                        className={`tab tab-lg w-full text-center ${
                          isActive
                            ? 'tab-active bg-base-100 text-base-content'
                            : 'text-base-content'
                        } border-0`}
                      >
                        {t.label}
                      </button>
                    </div>

                    {!isLast && (
                      <div className="hidden md:flex items-center flex-none" aria-hidden>
                        <span className="mx-3 h-6 w-[2px] bg-gray-300 flex-shrink-0" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
          </div>

          <div className="flex-none px-1">
            <button
              type="button"
              aria-label="Scroll tabs right"
              onClick={() => scrollTabsBy(220)}
              className="btn btn-ghost btn-sm pointer-events-auto h-8 w-8 p-0 flex items-center justify-center text-base-content"
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
