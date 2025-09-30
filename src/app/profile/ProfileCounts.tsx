'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

type TaskShape = {
  id: string;
  title: string;
  projectId?: string | null;
  ownerId?: string;
};

export default function ProfileCounts() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [taskCount, setTaskCount] = useState<number | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setTaskCount(0);
      setProjectCount(0);
      return;
    }

    const uid = user.id;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/profile/counts?ownerId=${encodeURIComponent(uid)}`);
        if (!res.ok) throw new Error(`fetch /api/profile/counts failed: ${res.status}`);
        const body: { taskCount: number; projectCount: number } = await res.json();
        if (cancelled) return;
        setTaskCount(body.taskCount ?? 0);
        setProjectCount(body.projectCount ?? 0);
        setError(null);
      } catch (err: unknown) {
        if (cancelled) return;
        setError(String(err));
        setTaskCount(null);
        setProjectCount(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="mt-6 p-4 rounded-md bg-base-100">
        <p className="mb-2">Sign in to see your projects and tasks.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-4">
      <div className="p-4 rounded-md bg-base-100">
        <div className="text-sm text-muted-foreground">Projects</div>
        <div className="text-2xl font-semibold">{loading ? '…' : projectCount ?? '—'}</div>
      </div>

      <div className="p-4 rounded-md bg-base-100">
        <div className="text-sm text-muted-foreground">Tasks</div>
        <div className="text-2xl font-semibold">{loading ? '…' : taskCount ?? '—'}</div>
      </div>

      {error ? (
        <div className="col-span-2 text-sm text-error">Error loading counts: {error}</div>
      ) : null}
    </div>
  );
}
