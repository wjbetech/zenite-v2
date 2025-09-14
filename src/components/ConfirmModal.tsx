'use client';

import React from 'react';

export default function ConfirmModal({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md bg-base-100 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-medium mb-2">{title ?? 'Confirm'}</h3>
        <div className="text-sm text-gray-600 mb-4">{message ?? 'Are you sure?'}</div>
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="btn btn-error" onClick={onConfirm} type="button">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
