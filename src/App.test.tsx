import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import App from "./App";

const auth = vi.hoisted(() => ({ session: null as { role: string; status: string } | null, initialize: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  getAuthSession: () => auth.session,
  isAuthenticated: () => Boolean(auth.session),
  initializeAuthSession: auth.initialize,
  clearAuthSession: vi.fn(),
  subscribeToAuthChanges: () => () => undefined,
}));
vi.mock("@/services/auth/idle-session", () => ({ watchSessionActivity: () => () => undefined }));
vi.mock("@/providers/AppProviders", () => ({ AppProviders: ({ children }: { children: ReactNode }) => children }));
vi.mock("./pages/Dashboard.tsx", () => ({ default: () => <p>Student dashboard</p> }));
vi.mock("./pages/AdminDashboard.tsx", () => ({ default: () => <p>Admin dashboard</p> }));
vi.mock("./pages/Signup.tsx", () => ({ default: () => <p>Login screen</p> }));

beforeEach(() => { window.scrollTo = vi.fn(); auth.initialize.mockResolvedValue(null); });
afterEach(cleanup);

it.each([["user", "/dashboard?tab=tests", "Student dashboard"], ["admin", "/admin?tab=users", "Admin dashboard"]])(
  "restores %s on the same URL and reacts to sign-out without navigation", async (role, url, label) => {
    auth.session = null;
    auth.initialize.mockImplementationOnce(async () => { auth.session = { role, status: "active" }; });
    window.history.replaceState({}, "", url);
    render(<App />);
    expect(await screen.findByText(label)).toBeInTheDocument();
    expect(window.location.pathname + window.location.search).toBe(url);
    act(() => { auth.session = null; window.dispatchEvent(new Event("aptitudeforge:auth-session-changed")); });
    expect(await screen.findByText("Login screen")).toBeInTheDocument();
    expect(window.history.state.usr.from).toBe(url);
  },
);
