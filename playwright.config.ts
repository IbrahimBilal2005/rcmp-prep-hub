import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4173", channel: process.platform === "win32" ? "msedge" : undefined, trace: "retain-on-failure" },
  projects: [
    { name: "phone", use: { viewport: { width: 360, height: 800 } } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: "https://audit.supabase.co",
      VITE_SUPABASE_ANON_KEY: "audit-public-key",
      VITE_APP_URL: "http://127.0.0.1:4173",
      VITE_USE_MOCK_AUTH: "false",
    },
  },
});
