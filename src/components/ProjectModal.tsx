'use client';

import React, { useEffect, useState } from 'react';

export type ProjectModalSubmit = {
  name: string;
  description?: string;
};

type ProjectModalProps = {
  open: boolean;
  onSubmit: (payload: ProjectModalSubmit) => Promise<void>;
  onCancel: () => void;
};

export default function ProjectModal({ open, onSubmit, onCancel }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError('Please provide a project name.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await onSubmit({
        name: trimmedName,
        description: trimmedDescription ? trimmedDescription : undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = () => {
    if (!submitting) {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={handleOverlayClick} />
      <form
        className="relative z-10 w-full max-w-xl rounded-lg bg-base-100 p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-semibold mb-4">Create project</h2>

        <label className="block text-sm font-medium" htmlFor="project-name">
          Name
        </label>
        <input
          id="project-name"
          className="input mt-1 w-full rounded-lg"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Project name"
          disabled={submitting}
          required
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="project-description">
          Description <span className="text-xs text-gray-500">(optional)</span>
        </label>
        <textarea
          id="project-description"
          className="textarea mt-1 w-full rounded-lg"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the project"
          rows={4}
          disabled={submitting}
        />

        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-2">
          <button className="btn btn-ghost" type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button className="btn btn-success" type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
