'use client';

import React, { useEffect, useRef } from 'react';

export default function ConfirmDeleteModal({
  open,
  itemTitle,
  onCancel,
  onConfirm,
  loading,
  confirmLabel,
}: {
  open: boolean;
  itemTitle?: string;
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
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md sm:max-w-lg border-2 bg-red-500 border-error-content rounded-lg p-6 shadow-lg">
        <h3 id="confirm-delete-title" className="text-lg font-medium mb-2">
          {`Delete ${itemTitle ?? 'task'}?`}
        </h3>
        <div className="text-lg font-semibold text-red-800 mb-2">Warning!</div>
        <div className=" text-neutral mb-4">
          {`This will permanently remove ${itemTitle ?? 'the task'}. Are you sure?`}
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
            {loading ? `${confirmLabel ?? 'Deleting Task'}...` : confirmLabel ?? 'Delete Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
