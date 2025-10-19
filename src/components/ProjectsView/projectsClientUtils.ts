'use client';

import type { Project } from '../../lib/projectStore';

export function commitProjects(
  list: Project[],
  {
    cancelled,
    setProjects,
    setDisplayedProjects,
    setMounted,
    setDbUnavailable,
  }: {
    cancelled: boolean;
    setProjects: (p: Project[]) => void;
    setDisplayedProjects: (p: Project[]) => void;
    setMounted: (v: boolean) => void;
    setDbUnavailable?: (v: boolean) => void;
  },
  options?: { dbAvailable?: boolean },
) {
  if (cancelled) return;
  setProjects(list);
  setDisplayedProjects(list);
  setMounted(true);
  if (options && options.dbAvailable !== undefined && setDbUnavailable) {
    setDbUnavailable(!options.dbAvailable);
  }
}
