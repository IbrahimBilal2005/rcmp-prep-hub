import { appConfig } from "@/config/app";
import { clearModuleProgress } from "@/lib/moduleProgressStorage";
import { clearPracticeAttempts } from "@/lib/practiceTestStorage";
import { hydratePersistedProgress } from "@/services/progress/supabase-sync";
import { getStoredAuthSession, saveStoredAuthSession, clearStoredAuthSession } from "@/services/auth/session-storage";
import type { AccountCredentials, AuthSession } from "@/services/auth/types";
import { supabase } from "@/services/supabase/client";

interface ProfileRow {
  full_name: string | null;
  plan: "free" | "premium" | null;
  role: "user" | "admin" | null;
  status: "active" | "invited" | "suspended" | null;
  created_at: string | null;
  access_expires_at: string | null;
}

const mapAuthErrorMessage = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes("user already registered") || normalized.includes("user already exists")) {
    return "An account already exists for that email. Use Login instead.";
  }

  if (normalized.includes("email rate limit exceeded")) {
    return "Too many email requests were sent recently. Wait a few minutes and try again.";
  }

  return message;
};

const isPremiumExpired = (profile: Pick<ProfileRow, "plan" | "access_expires_at"> | null) => {
  if (!profile || profile.plan !== "premium" || !profile.access_expires_at) {
    return false;
  }

  return new Date(profile.access_expires_at).getTime() <= Date.now();
};

const buildProfile = (
  id: string,
  session: AuthSession | null,
  email: string,
  name?: string,
  plan: AuthSession["plan"] = session?.plan || "free",
  role: AuthSession["role"] = session?.role || "user",
  status: AuthSession["status"] = session?.status || "active",
  createdAt?: string,
): AuthSession => ({
  id,
  name: name?.trim() || session?.name || "AptitudeForge User",
  email: email.trim(),
  plan,
  role,
  status,
  createdAt: createdAt || session?.createdAt || new Date().toISOString(),
});

const loadProfileRow = async (userId: string): Promise<ProfileRow | null> => {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, plan, role, status, created_at, access_expires_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile row", error);
    return null;
  }

  return data;
};

const updateProfileName = async (userId: string, fullName: string) => {
  if (!supabase) {
    return;
  }

  await supabase
    .from("profiles")
    .update({ full_name: fullName.trim() || "AptitudeForge User" })
    .eq("id", userId);
};

const downgradeExpiredProfile = async (userId: string) => {
  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      plan: "free",
      access_expires_at: null,
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to downgrade expired premium profile", error);
  }
};

const buildSessionFromSupabaseUser = async (
  user: NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]>,
  fallback?: AuthSession | null,
): Promise<AuthSession> => {
  let profile = await loadProfileRow(user.id);

  if (isPremiumExpired(profile)) {
    await downgradeExpiredProfile(user.id);
    profile = profile
      ? {
          ...profile,
          plan: "free",
          access_expires_at: null,
        }
      : profile;
  }

  const fullName =
    profile?.full_name ||
    (typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : undefined) ||
    fallback?.name;

  return buildProfile(
    user.id,
    fallback || null,
    user.email || fallback?.email || "",
    fullName,
    profile?.plan || fallback?.plan || "free",
    profile?.role || fallback?.role || "user",
    profile?.status || fallback?.status || "active",
    profile?.created_at || user.created_at || fallback?.createdAt,
  );
};

export const getAuthSession = () => getStoredAuthSession();

export const saveAuthSession = (session: AuthSession) => {
  saveStoredAuthSession(session);
};

export const clearAuthSession = async () => {
  if (supabase && !appConfig.useMockAuth) {
    await supabase.auth.signOut();
  }

  clearStoredAuthSession();
  clearModuleProgress();
  clearPracticeAttempts();
};

export const isAuthenticated = () => {
  const session = getAuthSession();
  return session !== null && session.status !== "suspended";
};

export const initializeAuthSession = async () => {
  if (appConfig.useMockAuth || !supabase) {
    return getAuthSession();
  }

  const stored = getAuthSession();
  const { data, error } = await supabase.auth.getSession();

  const user = data.session?.user;

  if (error || !user) {
    clearStoredAuthSession();
    return null;
  }

  const session = await buildSessionFromSupabaseUser(user, stored);
  if (session.status === "suspended") {
    await supabase.auth.signOut();
    clearStoredAuthSession();
    clearModuleProgress();
    clearPracticeAttempts();
    return null;
  }
  saveStoredAuthSession(session);
  await hydratePersistedProgress(session.id);
  return session;
};

export const subscribeToAuthChanges = (onResolved?: (session: AuthSession | null) => void) => {
  if (appConfig.useMockAuth || !supabase) {
    return () => undefined;
  }

  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      clearStoredAuthSession();
      onResolved?.(null);
      return;
    }

    const nextSession = await buildSessionFromSupabaseUser(session.user, getAuthSession());
    if (nextSession.status === "suspended") {
      await supabase.auth.signOut();
      clearStoredAuthSession();
      clearModuleProgress();
      clearPracticeAttempts();
      onResolved?.(null);
      return;
    }
    saveStoredAuthSession(nextSession);
    await hydratePersistedProgress(nextSession.id);
    onResolved?.(nextSession);
  });

  return () => {
    data.subscription.unsubscribe();
  };
};

export const signUpWithEmail = async ({ name, email, password }: AccountCredentials) => {
  if (appConfig.useMockAuth || !supabase) {
    return buildProfile("mock-user", null, email, name);
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
    throw new Error(mapAuthErrorMessage(result.error.message));
  }

  const user = result.data.user;

  if (!user) {
    throw new Error("Supabase did not return a user record after sign up.");
  }

  if (name?.trim()) {
    await updateProfileName(user.id, name);
  }

  clearModuleProgress();
  clearPracticeAttempts();
  const nextSession = await buildSessionFromSupabaseUser(user, null);
  if (nextSession.status === "suspended") {
    await supabase.auth.signOut();
    throw new Error("This account is currently suspended. Contact support if you need access restored.");
  }

  return nextSession;
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
    throw new Error(mapAuthErrorMessage(result.error.message));
  }

  const user = result.data.user;

  if (!user) {
    throw new Error("Supabase did not return a user record after sign in.");
  }

  const session = await buildSessionFromSupabaseUser(user, existing);
  if (session.status === "suspended") {
    await supabase.auth.signOut();
    throw new Error("This account is currently suspended. Contact support if you need access restored.");
  }

  await hydratePersistedProgress(session.id);
  return session;
};
