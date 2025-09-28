const API_BASE = '/api';

async function safeJson<T = unknown>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({} as T));
  if (!res.ok) {
    const obj = data as unknown as Record<string, unknown>;
    const message =
      obj && typeof obj === 'object' && 'message' in obj
        ? String(obj['message'])
        : `Request failed with status ${res.status}`;
    const err = new Error(message) as Error & { status?: number; data?: unknown };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

async function request<T = unknown>(input: RequestInfo, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(input, init);
    return await safeJson<T>(res);
  } catch (e) {
    // Normalize any thrown value into an Error instance
    if (e instanceof Error) throw e;
    const err = new Error(String(e ?? 'Unknown network error')) as Error & { original?: unknown };
    err.original = e;
    throw err;
  }
}

export async function fetchProjects() {
  return request(`${API_BASE}/projects`);
}

export async function createProject(payload: { name: string; description?: string }) {
  return request(`${API_BASE}/projects`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function updateProject(payload: {
  id: string;
  name?: string;
  description?: string | null;
}) {
  return request(`${API_BASE}/projects`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function deleteProject(id: string) {
  return request(`${API_BASE}/projects?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function fetchTasks() {
  return request(`${API_BASE}/tasks`);
}

export type CreateTaskPayload = {
  title: string;
  description?: string;
  dueDate?: string | null;
  projectId?: string | null;
  recurrence?: string | null;
  started?: boolean;
  completed?: boolean;
  completedAt?: string | null;
};

export async function createTask(payload: CreateTaskPayload) {
  return request(`${API_BASE}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
}

export type UpdateTaskPayload = {
  id: string;
  title?: string;
  notes?: string | null;
  description?: string | null;
  dueDate?: string | null;
  recurrence?: string | null;
  projectId?: string | null;
  ownerId?: string;
  started?: boolean;
  completed?: boolean;
  completedAt?: string | null;
};

export async function updateTask(payload: UpdateTaskPayload) {
  return request(`${API_BASE}/tasks`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function deleteTask(id: string) {
  return request(`${API_BASE}/tasks?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}

const api = {
  fetchProjects,
  createProject,
  deleteProject,
  fetchTasks,
  createTask,
  updateTask,
  updateProject,
  deleteTask,
};
export default api;
