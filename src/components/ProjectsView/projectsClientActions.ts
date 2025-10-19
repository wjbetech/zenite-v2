'use client';

import api from '../../lib/api';
import useProjectStore, {
  RemoteProject,
  normalizeRemoteProject,
  Project,
} from '../../lib/projectStore';

export async function createProjectAndUpdateStore({
  name,
  description,
}: {
  name: string;
  description?: string;
}): Promise<Project> {
  const trimmedName = name.trim();
  const trimmedDescription = description?.trim();
  if (!trimmedName) throw new Error('Project name is required');

  const store = useProjectStore.getState();

  const response = (await api.createProject({
    name: trimmedName,
    description: trimmedDescription || undefined,
  })) as Record<string, unknown>;

  const normalized = normalizeRemoteProject(response as RemoteProject);
  if (!normalized.id) throw new Error('The server returned a project without an id');

  const current = store.projects;
  const nextProjects = [normalized, ...current.filter((p) => p.id !== normalized.id)];
  store.setProjects(nextProjects);

  return normalized as Project;
}
