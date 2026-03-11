import { appConfig } from "@/config/app";
import { getStoredAuthSession, saveStoredAuthSession, clearStoredAuthSession } from "@/services/auth/session-storage";
import type { AccountCredentials, AuthSession } from "@/services/auth/types";
import { supabase } from "@/services/supabase/client";

const buildProfile = (session: AuthSession | null, email: string, name?: string) => ({
  name: name?.trim() || session?.name || "AptitudeForge User",
  email: email.trim(),
  createdAt: session?.createdAt || new Date().toISOString(),
});

export const getAuthSession = () => getStoredAuthSession();

export const saveAuthSession = (session: AuthSession) => {
  saveStoredAuthSession(session);
};

export const clearAuthSession = async () => {
  if (supabase && !appConfig.useMockAuth) {
    await supabase.auth.signOut();
  }

  clearStoredAuthSession();
};

export const isAuthenticated = () => getAuthSession() !== null;

export const signUpWithEmail = async ({ name, email, password }: AccountCredentials) => {
  if (appConfig.useMockAuth || !supabase) {
    return buildProfile(null, email, name);
  }

  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name?.trim() || "",
      },
    },
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return buildProfile(null, result.data.user?.email || email, name || result.data.user?.user_metadata.full_name);
};

export const signInWithEmail = async ({ email, password }: AccountCredentials) => {
  const existing = getAuthSession();

  if (appConfig.useMockAuth || !supabase) {
    if (!existing || existing.email.toLowerCase() !== email.trim().toLowerCase()) {
      throw new Error("No account found for that email yet. Create an account first.");
    }

    return existing;
  }

  const result = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  const user = result.data.user;
  return {
    ...buildProfile(existing, user.email || email, user.user_metadata.full_name),
    plan: existing?.plan || "free",
  } satisfies AuthSession;
};
