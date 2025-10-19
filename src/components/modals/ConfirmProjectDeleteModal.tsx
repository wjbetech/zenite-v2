'use client';

import React, { useEffect, useRef } from 'react';

export default function ConfirmModal({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  loading,
  confirmLabel,
}: {
  open: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  confirmLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md sm:max-w-lg bg-red-500 border-2 border-error-content text-gray-100 rounded-lg p-6 shadow-lg">
        <h3 id="confirm-title" className="text-lg font-medium mb-2">
          {title ?? 'Delete Project?'}
        </h3>
        <div className="text-lg font-semibold text-red-800 mb-2">Warning!</div>
        <div className="text-gray-100 mb-4">
          {message ?? 'This will permanently remove the project and its tasks. Are you sure?'}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="btn btn-warning border-2 border-warning-content text-warning-content"
            onClick={onCancel}
            type="button"
            disabled={!!loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-error border-2 border-error-content text-error-content"
            onClick={onConfirm}
            type="button"
            disabled={!!loading}
            aria-busy={!!loading}
          >
            {loading
              ? `${confirmLabel ?? 'Deleting Project'}...`
              : confirmLabel ?? 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
