'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export default function TimerWidget({
  open: controlledOpen,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState<boolean>(controlledOpen ?? false);

  // sync controlled prop
  React.useEffect(() => {
    if (typeof controlledOpen === 'boolean') setOpen(controlledOpen);
  }, [controlledOpen]);

  // timer state (seconds remaining)
  const [durationSec, setDurationSec] = useState(5 * 60); // default 5:00
  const [remaining, setRemaining] = useState(durationSec);

  // stopwatch state (elapsed seconds)
  const [elapsed, setElapsed] = useState(0);

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    setRemaining(durationSec);
  }, [durationSec]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastRef.current = null;
      return;
    }

    const loop = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;

      if (mode === 'timer') {
        setRemaining((r) => {
          const next = Math.max(0, r - dt);
          if (next === 0) setRunning(false);
          return next;
        });
      } else {
        setElapsed((e) => e + dt);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    };
  }, [running, mode]);

  const start = () => {
    // if timer and remaining is zero, reset to duration
    if (mode === 'timer' && remaining <= 0) setRemaining(durationSec);
    setRunning(true);
  };
  const stop = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setRemaining(durationSec);
  };

  // helpers for display
  const timerDisplay = () => {
    const total = Math.max(0, Math.round(remaining));
    const mm = Math.floor(total / 60);
    const ss = total % 60;
    return `${pad(mm)}:${pad(ss)}`;
  };

  const stopwatchDisplay = () => {
    const total = Math.max(0, Math.round(elapsed));
    const mm = Math.floor(total / 60);
    const ss = total % 60;
    return `${pad(mm)}:${pad(ss)}`;
  };

  return (
    <div className="w-full">
      {/* only show internal toggle when parent didn't control the open state */}
      {typeof controlledOpen === 'undefined' && (
        <div className="w-full border border-transparent mb-2 flex items-center justify-end">
          <button
            onClick={() => {
              const next = !open;
              setOpen(next);
              onOpenChange?.(next);
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
            aria-expanded={open}
          >
            {open ? 'Hide timer' : 'Show timer'}
          </button>
        </div>
      )}

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out will-change-[opacity,transform,height] ${
          open
            ? 'max-h-[1200px] opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-stretch bg-base-100 border border-gray-200 p-4 rounded-md">
          {/* top mode selector */}
          <div className="flex items-center gap-2 mb-3 p-2 rounded-md bg-base-200 w-full">
            <button
              aria-pressed={mode === 'timer'}
              onClick={() => setMode('timer')}
              className={`flex-1 text-center cursor-pointer px-3 py-2 rounded-md text-sm ${
                mode === 'timer' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600'
              }`}
            >
              Timer
            </button>
            <button
              aria-pressed={mode === 'stopwatch'}
              onClick={() => setMode('stopwatch')}
              className={`flex-1 text-center cursor-pointer px-3 py-2 rounded-md text-sm ${
                mode === 'stopwatch' ? 'bg-emerald-200 text-emerald-700' : 'text-gray-600'
              }`}
            >
              Stopwatch
            </button>
          </div>

          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-2">
              {mode === 'timer' ? 'Countdown Timer' : 'Stopwatch'}
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl font-mono">
                {mode === 'timer' ? timerDisplay() : stopwatchDisplay()}
              </div>
            </div>

            {mode === 'timer' && (
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="number"
                  min={0}
                  value={Math.floor(durationSec / 60)}
                  onChange={(e) =>
                    setDurationSec(Math.max(0, Number(e.target.value) * 60 + (durationSec % 60)))
                  }
                  className="w-16 input px-2 py-1 rounded border"
                  aria-label="minutes"
                />
                <span className="text-sm text-gray-500">mins</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={durationSec % 60}
                  onChange={(e) =>
                    setDurationSec(
                      Math.max(0, Math.floor(durationSec / 60) * 60 + Number(e.target.value)),
                    )
                  }
                  className="w-16 input px-2 py-1 rounded border mr-1"
                  aria-label="seconds"
                />
                <span className="text-sm text-gray-500">secs</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={reset}
                title="Reset"
                className="p-2 rounded-md hover:bg-base-200 cursor-pointer"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {running ? (
                <button
                  onClick={stop}
                  title="Stop"
                  className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <Square className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={start}
                  title="Start"
                  className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <Play className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
