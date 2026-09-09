import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { initializeAuthSession, subscribeToAuthChanges, signUpWithEmail } from "./service";
import { getStoredAuthSession } from "./session-storage";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(), refreshSession: vi.fn(), signOut: vi.fn(), signUp: vi.fn(),
  onAuthStateChange: vi.fn(), profile: vi.fn(), hydrate: vi.fn(),
}));
vi.mock("@/config/app", () => ({ appConfig: { useMockAuth: false, sessionIdleMinutes: 60, appUrl: "https://www.aptitudeforge.ca" } }));
vi.mock("@/services/progress/supabase-sync", () => ({ hydratePersistedProgress: mocks.hydrate }));
vi.mock("@/services/supabase/client", () => ({ supabase: {
  auth: mocks,
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.profile }) }) }),
} }));
const user = { id: "student", email: "student@example.com", user_metadata: {}, created_at: "2026-01-01" };
beforeEach(() => {
  localStorage.clear(); vi.clearAllMocks();
  mocks.profile.mockResolvedValue({ data: { role: "user", status: "active", plan: "free" }, error: null });
  mocks.hydrate.mockResolvedValue(undefined);
  mocks.signOut.mockResolvedValue({ error: null });
  mocks.getSession.mockResolvedValue({ data: { session: { user } }, error: null });
  mocks.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
});
afterEach(() => vi.useRealTimers());

it.each(["user", "admin"])("restores the verified %s profile from Supabase", async (role) => {
  mocks.profile.mockResolvedValue({ data: { role, status: "active", plan: "free" }, error: null });
  expect((await initializeAuthSession())?.role).toBe(role);
  expect(getStoredAuthSession()?.id).toBe(user.id);
});

it("does not hold the auth callback open while loading the profile", async () => {
  vi.useFakeTimers();
  const stop = subscribeToAuthChanges();
  const callback = mocks.onAuthStateChange.mock.calls[0][0];
  expect(callback("TOKEN_REFRESHED", { user })).toBeUndefined();
  expect(mocks.profile).not.toHaveBeenCalled();
  await vi.runAllTimersAsync();
  expect(getStoredAuthSession()?.id).toBe(user.id);
  stop();
});

it("does not restore an obsolete profile after sign-out", async () => {
  vi.useFakeTimers();
  const stop = subscribeToAuthChanges();
  const callback = mocks.onAuthStateChange.mock.calls[0][0];
  callback("SIGNED_IN", { user });
  callback("SIGNED_OUT", null);
  await vi.runAllTimersAsync();
  expect(getStoredAuthSession()).toBeNull();
  stop();
});

it("requires email confirmation when signup returns no session", async () => {
  mocks.signUp.mockResolvedValue({ data: { user, session: null }, error: null });
  expect(await signUpWithEmail({ email: user.email, password: "example-password" })).toBeNull();
  expect(getStoredAuthSession()).toBeNull();
  expect(mocks.signUp.mock.calls[0][0].options.emailRedirectTo).toBe("https://www.aptitudeforge.ca/signup?mode=login");
});

it("expires an inactive persisted session before restoring a protected page", async () => {
  localStorage.setItem("aptitudeforge.auth-last-activity", String(Date.now() - 61 * 60_000));
  expect(await initializeAuthSession()).toBeNull();
  expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" });
  expect(mocks.getSession).not.toHaveBeenCalled();
});
