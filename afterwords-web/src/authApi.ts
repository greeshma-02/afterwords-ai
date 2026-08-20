import { ROUTES } from "./routes";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5259/api";

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  token: string;
}

const AUTH_STORAGE_KEY = "afterwords_auth";

export function getStoredAuth(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function storeAuth(user: AuthUser): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredAuth()?.token);
}

export function getSignInRedirectPath(returnTo: string): string {
  const safeReturnTo = returnTo.startsWith("/afterwords") ? returnTo : ROUTES.home;
  return `${ROUTES.signIn}?returnTo=${encodeURIComponent(safeReturnTo)}`;
}

async function postAuth<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }

  return data as T;
}

function normalizeAuthUser(data: Record<string, unknown>): AuthUser {
  return {
    id: Number(data.id),
    fullName: String(data.fullName ?? ""),
    email: String(data.email ?? ""),
    avatarUrl: data.avatarUrl ? String(data.avatarUrl) : undefined,
    token: String(data.token ?? ""),
  };
}

export async function signUp(payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const data = await postAuth<Record<string, unknown>>("/auth/signup", payload);
  const user = normalizeAuthUser(data);
  storeAuth(user);
  return user;
}

export async function signIn(payload: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  const data = await postAuth<Record<string, unknown>>("/auth/signin", payload);
  const user = normalizeAuthUser(data);
  storeAuth(user);
  return user;
}

export async function googleSignIn(payload: {
  credential?: string;
  accessToken?: string;
}): Promise<AuthUser> {
  const data = await postAuth<Record<string, unknown>>("/auth/google", payload);
  const user = normalizeAuthUser(data);
  storeAuth(user);
  return user;
}
