'use client';

import { useEffect, useState } from 'react';
import useProjectStore, {
  Project,
  RemoteProject,
  normalizeRemoteProject,
} from '../../lib/projectStore';
import api from '../../lib/api';
import { commitProjects } from './projectsClientUtils';

export default function useProjectsInitializer(initialProjects?: Project[]) {
  const setProjectsStore = useProjectStore((s) => s.setProjects);

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>(
    (initialProjects || []).map((p) => {
      const pp = p as Partial<Project>;
      return {
        ...(pp as Project),
        taskCount: typeof pp.taskCount === 'number' ? pp.taskCount : 0,
      } as Project;
    }),
  );
  const [dbUnavailable, setDbUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initProjects() {
      setLoading(true);
      try {
        if (!initialProjects || initialProjects.length === 0) {
          const remote = (await fetch('/api/projects')
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)) as unknown;
          if (Array.isArray(remote)) {
            const remapped = (remote as RemoteProject[])
              .map((item) => normalizeRemoteProject(item))
              .filter((project): project is Project => Boolean(project.id));
            commitProjects(
              remapped,
              {
                cancelled,
                setProjects: setProjectsStore,
                setDisplayedProjects,
                setMounted,
                setDbUnavailable,
              },
              { dbAvailable: true },
            );
            return;
          }

          commitProjects(
            [],
            {
              cancelled,
              setProjects: setProjectsStore,
              setDisplayedProjects,
              setMounted,
              setDbUnavailable,
            },
            { dbAvailable: false },
          );
          return;
        }

        const allHaveCounts = (initialProjects as Project[]).every(
          (p) => typeof p.taskCount === 'number',
        );
        if (allHaveCounts) {
          commitProjects(
            initialProjects as Project[],
            {
              cancelled,
              setProjects: setProjectsStore,
              setDisplayedProjects,
              setMounted,
              setDbUnavailable,
            },
            { dbAvailable: true },
          );
          return;
        }

        const remote = (await fetch('/api/projects')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)) as unknown;
        if (Array.isArray(remote) && remote.length > 0) {
          const remapped = (remote as RemoteProject[])
            .map((item) => normalizeRemoteProject(item))
            .filter((project): project is Project => Boolean(project.id));
          commitProjects(
            remapped,
            {
              cancelled,
              setProjects: setProjectsStore,
              setDisplayedProjects,
              setMounted,
              setDbUnavailable,
            },
            { dbAvailable: true },
          );
          return;
        }

        const tasks = await api.fetchTasks().catch(() => []);
        type ApiTask = { id?: string; projectId?: string | null; project?: { id?: string } };
        const taskArr = Array.isArray(tasks) ? (tasks as ApiTask[]) : [];

        const counts = taskArr.reduce<Record<string, number>>((acc, task) => {
          const pid = (task && (task.projectId ?? task.project?.id)) || null;
          if (!pid) return acc;
          acc[pid] = (acc[pid] ?? 0) + 1;
          return acc;
        }, {});

        const merged = (initialProjects as Project[]).map((project) => ({
          ...project,
          taskCount:
            typeof project.taskCount === 'number' ? project.taskCount : counts[project.id] ?? 0,
        }));

        commitProjects(
          merged,
          {
            cancelled,
            setProjects: setProjectsStore,
            setDisplayedProjects,
            setMounted,
            setDbUnavailable,
          },
          { dbAvailable: true },
        );
      } catch (err) {
        console.warn('useProjectsInitializer: failed to fetch projects; showing initial data', err);
        commitProjects(
          initialProjects ? (initialProjects as Project[]) : [],
          {
            cancelled,
            setProjects: setProjectsStore,
            setDisplayedProjects,
            setMounted,
            setDbUnavailable,
          },
          { dbAvailable: true },
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initProjects();

    return () => {
      cancelled = true;
    };
  }, [initialProjects, setProjectsStore]);

  return {
    displayedProjects,
    setDisplayedProjects,
    loading,
    mounted,
    setMounted,
    dbUnavailable,
    setDbUnavailable,
  } as const;
}
