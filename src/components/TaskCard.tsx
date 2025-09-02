'use client';

import React, { useState } from 'react';
import { Edit, Trash, Check } from 'lucide-react';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string | null;
  createdAt: string;
  completed?: boolean;
};

type Props = {
  task: Task;
  right?: React.ReactNode;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: 'none' | 'done' | 'tilde') => void;
};

export default function TaskCard({ task, right, onEdit, onDelete, onStatusChange }: Props) {
  const [status, setStatus] = useState<'none' | 'done' | 'tilde'>('none');

  const cycleStatus = () => {
    const next = status === 'none' ? 'done' : status === 'done' ? 'tilde' : 'none';
    setStatus(next);
    onStatusChange?.(task.id, next);
  };

  const bgClass =
    status === 'done'
      ? 'bg-emerald-500/25'
      : status === 'tilde'
      ? 'bg-amber-500/25'
      : 'bg-white dark:bg-gray-900';

  return (
    <div
      className={`${bgClass} rounded-md shadow-sm border border-gray-100 dark:border-zinc-800 p-3`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {task.title}
                </div>

                {/* tri-state checkbox placed next to the title */}
                <button
                  aria-label="Toggle task status"
                  onClick={cycleStatus}
                  className="h-5 w-5 flex items-center justify-center rounded border text-xs cursor-pointer"
                  title={
                    status === 'none'
                      ? 'Mark done'
                      : status === 'done'
                      ? 'Mark tilde'
                      : 'Clear status'
                  }
                >
                  {status === 'done' ? (
                    <Check className="h-4 w-4 text-black" strokeWidth={2} />
                  ) : status === 'tilde' ? (
                    <span className="text-sm font-bold text-black">~</span>
                  ) : null}
                </button>
              </div>

              <div className="flex items-center gap-3">
                {onEdit && (
                  <button
                    aria-label="Edit task"
                    onClick={() => onEdit(task)}
                    className="cursor-pointer text-amber-500 hover:text-amber-700 dark:text-amber-400"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}

                {onDelete && (
                  <button
                    aria-label="Delete task"
                    onClick={() => onDelete(task.id)}
                    className="cursor-pointer text-red-500 hover:text-red-700 dark:text-red-400"
                    title="Delete"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-2">
            {right && <div className="text-xs text-gray-400 ml-4 dark:text-white">{right}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
