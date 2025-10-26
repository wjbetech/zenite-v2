'use client';

import React from 'react';
import { normalizeWhitespaceForTyping } from '../../lib/text-sanitizer';
import { sanitizeTitle } from '../../lib/text-format';
import { sanitizeDescriptionPreserveNewlines } from '../../lib/text-format';

export default function ProjectCreationFields({
  newProjectName,
  setNewProjectName,
  newProjectDescription,
  setNewProjectDescription,
  newProjectLoading,
  onCreateProjectKeyDown,
}: {
  newProjectName: string;
  setNewProjectName: (v: string) => void;
  newProjectDescription: string;
  setNewProjectDescription: (v: string) => void;
  newProjectLoading: boolean;
  onCreateProjectKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="mb-8">
      <label className="block mb-2">New Project</label>
      <input
        value={newProjectName}
        onChange={(e) => setNewProjectName(normalizeWhitespaceForTyping(e.target.value))}
        onBlur={() => setNewProjectName(sanitizeTitle(newProjectName || ''))}
        onKeyDown={onCreateProjectKeyDown}
        className="input w-full mb-2 rounded-lg"
        disabled={newProjectLoading}
      />
      <label className="block mt-2 mb-2 text-sm font-medium" htmlFor="new-project-description">
        Description <span className="text-xs text-gray-500">(optional)</span>
      </label>
      <textarea
        id="new-project-description"
        value={newProjectDescription}
        onChange={(e) => setNewProjectDescription(normalizeWhitespaceForTyping(e.target.value))}
        onBlur={() =>
          setNewProjectDescription(sanitizeDescriptionPreserveNewlines(newProjectDescription || ''))
        }
        className="textarea w-full rounded-lg bg-base-100 whitespace-pre-wrap"
        rows={3}
        disabled={newProjectLoading}
        placeholder="Optional description for the project"
      />
    </div>
  );
}
