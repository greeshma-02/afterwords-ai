import { getStoredAuth } from "./authApi";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5259/api";

export interface ApiReflection {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  title: string;
  body: string;
  moods: string;
  containsSpoilers: boolean;
  visibility: string;
  authorName: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface CreateReflectionPayload {
  bookId: number;
  title: string;
  body: string;
  moods: string[];
  containsSpoilers: boolean;
  visibility: "public" | "private";
  authorName?: string;
}

function normalizeReflection(data: Record<string, unknown>): ApiReflection {
  return {
    id: Number(data.id),
    bookId: Number(data.bookId),
    bookTitle: String(data.bookTitle ?? ""),
    bookAuthor: String(data.bookAuthor ?? ""),
    title: String(data.title ?? ""),
    body: String(data.body ?? ""),
    moods: String(data.moods ?? ""),
    containsSpoilers: Boolean(data.containsSpoilers),
    visibility: String(data.visibility ?? "private"),
    authorName: String(data.authorName ?? "Anonymous"),
    likesCount: Number(data.likesCount ?? 0),
    commentsCount: Number(data.commentsCount ?? 0),
    createdAt: String(data.createdAt ?? ""),
  };
}

function authHeaders(): HeadersInit {
  const auth = getStoredAuth();
  if (!auth?.token) {
    throw new Error("Please sign in to continue.");
  }

  return {
    Authorization: `Bearer ${auth.token}`,
    "Content-Type": "application/json",
  };
}

export function reflectionQuote(body: string, maxLength = 160): string {
  const trimmed = body.trim();
  if (!trimmed) return "";
  const firstSentence = trimmed.match(/^[^.!?]+[.!?]?/)?.[0]?.trim();
  const excerpt = firstSentence && firstSentence.length <= maxLength ? firstSentence : trimmed;
  return excerpt.length > maxLength ? `${excerpt.slice(0, maxLength).trim()}…` : excerpt;
}

export function formatReflectionDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatReflectionCardDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function authorInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export async function createReflection(
  payload: CreateReflectionPayload,
): Promise<ApiReflection> {
  const res = await fetch(`${API_BASE}/reflections`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Save failed (${res.status})`);
  }

  return normalizeReflection(data as Record<string, unknown>);
}

export async function fetchReflection(id: string): Promise<ApiReflection> {
  const auth = getStoredAuth();
  const headers: HeadersInit = auth?.token
    ? { Authorization: `Bearer ${auth.token}` }
    : {};

  const res = await fetch(`${API_BASE}/reflections/${id}`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? "Reflection not found.");
  }
  return normalizeReflection(data as Record<string, unknown>);
}

export async function deleteReflection(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/reflections/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Delete failed (${res.status})`);
  }
}

export async function fetchMyReflections(): Promise<ApiReflection[]> {
  const auth = getStoredAuth();
  if (!auth?.token) {
    throw new Error("Please sign in to view your reflections.");
  }

  const res = await fetch(`${API_BASE}/reflections/mine`, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Could not load reflections (${res.status})`);
  }

  return Array.isArray(data)
    ? data.map((item) => normalizeReflection(item as Record<string, unknown>))
    : [];
}

export async function fetchReflectionsByBook(bookId: number): Promise<ApiReflection[]> {
  const res = await fetch(`${API_BASE}/reflections/book/${bookId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Could not load reflections (${res.status})`);
  }

  return Array.isArray(data)
    ? data.map((item) => normalizeReflection(item as Record<string, unknown>))
    : [];
}
