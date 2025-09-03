const API_BASE = '/api';

async function safeJson<T = unknown>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({} as T));
  if (!res.ok) throw data;
  return data as T;
}

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  return safeJson(res);
}

export async function createProject(payload: { name: string; description?: string }) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  return safeJson(res);
}

export async function deleteProject(id: string) {
  const res = await fetch(`${API_BASE}/projects?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return safeJson(res);
}

export async function fetchTasks() {
  const res = await fetch(`${API_BASE}/tasks`);
  return safeJson(res);
}

export type CreateTaskPayload = {
  title: string;
  description?: string;
  dueDate?: string | null;
  projectId?: string | null;
};

export async function createTask(payload: CreateTaskPayload) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  return safeJson(res);
}

export async function deleteTask(id: string) {
  const res = await fetch(`${API_BASE}/tasks?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  return safeJson(res);
}

const api = { fetchProjects, createProject, deleteProject, fetchTasks, createTask, deleteTask };
export default api;
