import type {
  Subject,
  SubjectFile,
  ClassItem,
  ClassFileInfo,
  ClassLink,
} from './types';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export const TOKEN_KEY = 'token';
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

// Rutas donde un 401 es una respuesta esperada y no debe cerrar la sesión:
// un login fallido no es "sesión expirada", y un logout no puede re-disparar el evento.
const SILENT_401_PATHS = ['/auth/login', '/auth/logout'];

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...headers, ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    if (res.status === 401 && !SILENT_401_PATHS.some((p) => path.startsWith(p))) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(res.status, err?.message || res.statusText || 'Request failed');
  }
  return res.json();
}

// Public
export const getSubjects = () => request<Subject[]>('/subjects');
export const getSubject = (id: string) => request<Subject & { classes: { class: ClassItem }[] }>(`/subjects/${id}`);
export const getClasses = (params?: { subjectId?: string; week?: number }) => {
  const q = new URLSearchParams();
  if (params?.subjectId) q.set('subjectId', params.subjectId);
  if (params?.week) q.set('week', String(params.week));
  const qs = q.toString();
  return request<ClassItem[]>(`/classes${qs ? `?${qs}` : ''}`);
};
export const getClassFileInfo = (id: string) =>
  request<ClassFileInfo>(`/classes/${id}/file-info`);

// Auth
export const login = (email: string, password: string) =>
  request<{ user: { id: string; email: string; name: string | null }; access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const logout = () =>
  request<{ message: string }>('/auth/logout', { method: 'POST' });

export const getMe = () =>
  request<{ user: { id: string; email: string; name: string | null } | null }>('/auth/me');

// Admin
export const createSubject = (data: {
  name: string;
  img?: string;
  files?: { title?: string; url: string }[];
}) =>
  request<Subject>('/subjects', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateSubject = (
  id: string,
  data: { name?: string; img?: string | null },
) =>
  request<Subject>(`/subjects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteSubject = (id: string) =>
  request<void>(`/subjects/${id}`, {
    method: 'DELETE',
  });

// Archivos relacionados con una asignatura
export const createSubjectFile = (
  subjectId: string,
  data: { title?: string; url: string },
) =>
  request<SubjectFile>(`/subjects/${subjectId}/files`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateSubjectFile = (
  subjectId: string,
  fileId: string,
  data: { title?: string; url?: string },
) =>
  request<SubjectFile>(`/subjects/${subjectId}/files/${fileId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteSubjectFile = (subjectId: string, fileId: string) =>
  request<void>(`/subjects/${subjectId}/files/${fileId}`, {
    method: 'DELETE',
  });

export const createClass = (
  data: {
    title: string;
    url: string;
    date: string;
    subjectIds: string[];
    links?: { title?: string; url: string }[];
  },
) =>
  request<ClassItem>('/classes', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateClass = (
  id: string,
  data: { title?: string; url?: string; date?: string; subjectIds?: string[] },
) =>
  request<ClassItem>(`/classes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteClass = (id: string) =>
  request<void>(`/classes/${id}`, {
    method: 'DELETE',
  });

// Links relacionados con una clase
export const createClassLink = (
  classId: string,
  data: { title?: string; url: string; subjectId?: string },
) =>
  request<ClassLink>(`/classes/${classId}/links`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateClassLink = (
  classId: string,
  linkId: string,
  data: { title?: string; url?: string; subjectId?: string | null },
) =>
  request<ClassLink>(`/classes/${classId}/links/${linkId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteClassLink = (classId: string, linkId: string) =>
  request<void>(`/classes/${classId}/links/${linkId}`, {
    method: 'DELETE',
  });
