import { appConfig } from "@/config/app";

const KEY = "aptitudeforge.auth-last-activity";
export const isSessionIdle = () => {
  const lastActivity = Number(localStorage.getItem(KEY));
  return lastActivity > 0 && Date.now() - lastActivity >= appConfig.sessionIdleMinutes * 60_000;
};
export const recordSessionActivity = () => localStorage.setItem(KEY, String(Date.now()));
export const clearSessionActivity = () => localStorage.removeItem(KEY);

export const watchSessionActivity = (hasSession: () => boolean, expire: () => void) => {
  let expiring = false;
  const check = (activity = false) => {
    if (!hasSession()) { expiring = false; return; }
    if (expiring) return;
    if (isSessionIdle()) {
      expiring = true;
      expire();
    } else if (activity) {
      recordSessionActivity();
    }
  };
  const onActivity = () => check(true);
  const onResume = () => check();
  const events = ["pointerdown", "keydown", "scroll", "touchstart"];
  events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
  window.addEventListener("focus", onResume);
  document.addEventListener("visibilitychange", onResume);
  const timer = window.setInterval(onResume, 1000);
  return () => {
    clearInterval(timer);
    events.forEach((event) => window.removeEventListener(event, onActivity));
    window.removeEventListener("focus", onResume);
    document.removeEventListener("visibilitychange", onResume);
  };
};
