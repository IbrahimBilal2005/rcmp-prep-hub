import { beforeEach, expect, it, vi } from "vitest";
import { hydratePersistedProgress } from "./supabase-sync";

const state = vi.hoisted(() => ({ userId: "user-a", fail: false, lessons: false, modules: vi.fn(), attempts: vi.fn() }));
vi.mock("@/config/app", () => ({ appConfig: { useMockAuth: false } }));
vi.mock("@/services/auth/session-storage", () => ({ getStoredAuthSession: () => ({ id: state.userId }) }));
vi.mock("@/lib/moduleProgressStorage", () => ({ clearModuleProgress: vi.fn(), replaceAllModuleProgress: state.modules }));
vi.mock("@/lib/practiceTestStorage", () => ({ clearPracticeAttempts: vi.fn(), replacePracticeAttempts: state.attempts }));
vi.mock("@/services/supabase/client", () => ({ supabase: { from: (table: string) => {
  const query = { select: () => query, eq: () => query, order: () => query, then: (resolve: (value: unknown) => unknown) =>
    Promise.resolve({ data: state.fail ? null : !state.lessons ? [] : table === "lessons" ? [{ id: 10, module_id: 1, sort_order: 0 }, { id: 20, module_id: 1, sort_order: 7 }]
      : table === "lesson_completions" ? [{ lesson_id: 10, lessons: { module_id: 1, sort_order: 0 } }, { lesson_id: 20, lessons: { module_id: 1, sort_order: 7 } }] : [], error: state.fail ? new Error("Offline") : null }).then(resolve) };
  return query;
} } }));
beforeEach(() => { state.fail = false; state.lessons = false; state.userId = "user-a"; vi.clearAllMocks(); });
it("does not erase local progress when the server cannot be reached", async () => {
  state.fail = true;
  const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
  await hydratePersistedProgress("user-a");
  expect(state.modules).not.toHaveBeenCalled();
  expect(state.attempts).not.toHaveBeenCalled();
  log.mockRestore();
});
it("does not apply a response belonging to a previous account", async () => {
  await hydratePersistedProgress("old-user");
  expect(state.modules).not.toHaveBeenCalled();
  expect(state.attempts).not.toHaveBeenCalled();
});

it("restores completions with zero-based or gapped lesson sort orders", async () => {
  state.lessons = true;
  await hydratePersistedProgress("user-a");
  expect(state.modules.mock.calls[0][0][1].completedLessons).toEqual([0, 1]);
});
