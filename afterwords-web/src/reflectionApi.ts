const API_BASE = "http://localhost:5259/api";

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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Save failed (${res.status})`);
  }

  return res.json();
}

export async function fetchReflection(id: string): Promise<ApiReflection> {
  const res = await fetch(`${API_BASE}/reflections/${id}`);
  if (!res.ok) {
    throw new Error("Reflection not found.");
  }
  return res.json();
}

export async function fetchReflectionsByBook(bookId: number): Promise<ApiReflection[]> {
  const res = await fetch(`${API_BASE}/reflections/book/${bookId}`);
  if (!res.ok) {
    throw new Error(`Could not load reflections (${res.status})`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
