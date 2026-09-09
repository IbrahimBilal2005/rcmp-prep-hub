import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isSessionIdle, recordSessionActivity, watchSessionActivity } from "./idle-session";

vi.mock("@/config/app", () => ({ appConfig: { sessionIdleMinutes: 60 } }));

describe("session inactivity", () => {
  beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-09T12:00:00Z")); });
  afterEach(() => vi.useRealTimers());

  it("preserves the activity deadline across reloads and expires after one hour", () => {
    recordSessionActivity();
    vi.advanceTimersByTime(59 * 60_000);
    expect(isSessionIdle()).toBe(false);
    vi.advanceTimersByTime(60_000);
    expect(isSessionIdle()).toBe(true);
  });

  it("extends active sessions but does not revive an expired session on a click", () => {
    recordSessionActivity();
    const expire = vi.fn();
    const stop = watchSessionActivity(() => true, expire);
    vi.advanceTimersByTime(59 * 60_000);
    window.dispatchEvent(new Event("keydown"));
    vi.advanceTimersByTime(59 * 60_000);
    expect(expire).not.toHaveBeenCalled();
    vi.setSystemTime(Date.now() + 61_000);
    window.dispatchEvent(new Event("pointerdown"));
    expect(expire).toHaveBeenCalledOnce();
    expect(isSessionIdle()).toBe(true);
    stop();
  });
});
