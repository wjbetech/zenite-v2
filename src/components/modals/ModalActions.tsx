'use client';

import React from 'react';

export default function ModalActions({
  submitError,
  onCancel,
  saving,
  submitLabel,
}: {
  submitError: string | null;
  onCancel: () => void;
  saving: boolean;
  submitLabel: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
      {submitError && <span className="mr-auto text-sm text-error">{submitError}</span>}
      <button
        className="btn btn-warning border-2 border-warning-content text-warning-content"
        onClick={onCancel}
        type="button"
      >
        Cancel
      </button>
      <button
        className="btn btn-success border-2 border-success-content text-success-content"
        type="submit"
        disabled={saving}
      >
        {saving ? 'Saving…' : submitLabel}
      </button>
    </div>
  );
}
