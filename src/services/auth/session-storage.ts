import type { AuthSession } from "@/services/auth/types";

const STORAGE_KEY = "aptitudeforge.auth-session";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getStoredAuthSession = (): AuthSession | null => {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as AuthSession) : null;
  } catch {
    return null;
  }
};

export const saveStoredAuthSession = (session: AuthSession) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredAuthSession = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
