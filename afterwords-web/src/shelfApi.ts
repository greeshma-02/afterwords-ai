import { getStoredAuth } from "./authApi";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5259/api";

export type ShelfStatus = "reading" | "finished" | "wishlist";

export interface ShelfItem {
  id: number;
  bookId: number;
  title: string;
  author: string;
  imageUrl?: string;
  status: ShelfStatus;
  progressPercent: number;
  currentPage?: number;
  totalPages?: number;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  hasReflection: boolean;
  reflectionId?: number;
  sadness?: number;
  comfort?: number;
  hope?: number;
  joy?: number;
  humor?: number;
  connection?: number;
}

export const SHELF_STATUS_OPTIONS: {
  id: ShelfStatus;
  label: string;
  description: string;
}[] = [
  {
    id: "wishlist",
    label: "Want to Read",
    description: "Save it for later",
  },
  {
    id: "reading",
    label: "Reading",
    description: "You're in the middle of it",
  },
  {
    id: "finished",
    label: "Finished",
    description: "You've closed the last page",
  },
];

export function shelfStatusLabel(status: ShelfStatus): string {
  return SHELF_STATUS_OPTIONS.find((option) => option.id === status)?.label ?? status;
}

export interface MoodShelfCount {
  mood: string;
  count: number;
}

export interface ShelfSummary {
  items: ShelfItem[];
  totalCount: number;
  readingCount: number;
  finishedCount: number;
  wishlistCount: number;
  moodShelves: MoodShelfCount[];
}

function normalizeShelfItem(data: Record<string, unknown>): ShelfItem {
  return {
    id: Number(data.id),
    bookId: Number(data.bookId),
    title: String(data.title ?? ""),
    author: String(data.author ?? ""),
    imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
    status: String(data.status ?? "wishlist") as ShelfItem["status"],
    progressPercent: Number(data.progressPercent ?? 0),
    currentPage: data.currentPage != null ? Number(data.currentPage) : undefined,
    totalPages: data.totalPages != null ? Number(data.totalPages) : undefined,
    startedAt: data.startedAt ? String(data.startedAt) : undefined,
    finishedAt: data.finishedAt ? String(data.finishedAt) : undefined,
    createdAt: String(data.createdAt ?? ""),
    hasReflection: Boolean(data.hasReflection),
    reflectionId: data.reflectionId != null ? Number(data.reflectionId) : undefined,
    sadness: data.sadness != null ? Number(data.sadness) : undefined,
    comfort: data.comfort != null ? Number(data.comfort) : undefined,
    hope: data.hope != null ? Number(data.hope) : undefined,
    joy: data.joy != null ? Number(data.joy) : undefined,
    humor: data.humor != null ? Number(data.humor) : undefined,
    connection: data.connection != null ? Number(data.connection) : undefined,
  };
}

export async function fetchMyShelf(): Promise<ShelfSummary> {
  const auth = getStoredAuth();
  if (!auth?.token) {
    throw new Error("Please sign in to view your shelf.");
  }

  const res = await fetch(`${API_BASE}/shelf`, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Could not load shelf (${res.status})`);
  }

  const items = Array.isArray(data.items)
    ? data.items.map((item: Record<string, unknown>) => normalizeShelfItem(item))
    : [];

  const moodShelves = Array.isArray(data.moodShelves)
    ? data.moodShelves.map((item: Record<string, unknown>) => ({
        mood: String(item.mood ?? ""),
        count: Number(item.count ?? 0),
      }))
    : [];

  return {
    items,
    totalCount: Number(data.totalCount ?? items.length),
    readingCount: Number(data.readingCount ?? 0),
    finishedCount: Number(data.finishedCount ?? 0),
    wishlistCount: Number(data.wishlistCount ?? 0),
    moodShelves,
  };
}

export async function addToShelf(
  bookId: number,
  status: ShelfItem["status"] = "wishlist",
): Promise<ShelfItem> {
  const auth = getStoredAuth();
  if (!auth?.token) {
    throw new Error("Please sign in to add books to your shelf.");
  }

  const res = await fetch(`${API_BASE}/shelf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bookId, status }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Could not add to shelf (${res.status})`);
  }

  return normalizeShelfItem(data as Record<string, unknown>);
}

export async function fetchShelfStatusForBook(
  bookId: number,
): Promise<ShelfItem | null> {
  const auth = getStoredAuth();
  if (!auth?.token) {
    return null;
  }

  const res = await fetch(`${API_BASE}/shelf/book/${bookId}`, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });

  if (res.status === 404) {
    return null;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Could not load shelf status (${res.status})`);
  }

  return normalizeShelfItem(data as Record<string, unknown>);
}

export async function updateShelfItem(
  bookId: number,
  payload: { status?: ShelfStatus; progressPercent?: number },
): Promise<ShelfItem> {
  const auth = getStoredAuth();
  if (!auth?.token) {
    throw new Error("Please sign in to update your shelf.");
  }

  const res = await fetch(`${API_BASE}/shelf/${bookId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Could not update shelf (${res.status})`);
  }

  return normalizeShelfItem(data as Record<string, unknown>);
}

export async function removeFromShelf(bookId: number): Promise<void> {
  const auth = getStoredAuth();
  if (!auth?.token) {
    throw new Error("Please sign in to update your shelf.");
  }

  const res = await fetch(`${API_BASE}/shelf/${bookId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Could not remove from shelf (${res.status})`);
  }
}
