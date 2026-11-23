import { test, expect, type Page } from "@playwright/test";

const question = { id: 1, question: "What is two plus two?", options: ["Four", "Five"], correct_index: 0, correct_indexes: [0], explanation: "Two plus two equals four.", sort_order: 1 };
const modules = [{ id: 1, slug: "numerical-skills", title: "Numerical Skills", description: "Develop your numerical reasoning skills.", sort_order: 1,
  lessons: [1, 2].map((id) => ({ id, title: `Lesson ${id}`, summary: "Learn and practise numerical reasoning.", chapter_label: "Foundations", duration_minutes: 5, sort_order: id, video_path: null, poster_path: null })) }];
const tests = [{ id: 1, slug: "numerical", title: "Numerical Practice", description: "Test your numerical reasoning.", category: "Numerical", time_limit_minutes: 15 }];
// Questions now arrive from the get_course_questions() RPC rather than embedded in modules/tests.
const courseQuestions = [
  { ...question, kind: "module_quiz", parent_id: 1, question_image_path: null },
  { ...question, kind: "practice_test", parent_id: 1, question_image_path: null },
  { ...question, id: 2, sort_order: 2, kind: "practice_test", parent_id: 1, question_image_path: null },
];

async function prepare(page: Page, role = "user", plan = "premium", signedIn = true) {
  const user = { id: "audit-user", aud: "authenticated", role: "authenticated", email: "test@example.com", user_metadata: {}, app_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
  const profile = { id: user.id, full_name: "Test User", email: user.email, role, plan, status: "active", created_at: user.created_at, access_expires_at: null };
  await page.route("https://audit.supabase.co/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("/auth/")) {
      return route.fulfill({ json: url.pathname.endsWith("/user") ? user : {} });
    }
    const table = url.pathname.split("/").pop();
    const data = table === "profiles" ? (url.searchParams.has("id") ? profile : [profile]) : table === "modules" ? modules : table === "practice_tests" ? tests : table === "get_course_questions" ? courseQuestions : [];
    await route.fulfill({ json: data });
  });
  if (signedIn) {
    await page.addInitScript(({ user }) => {
      if (sessionStorage.getItem("audit-initialized")) return;
      sessionStorage.setItem("audit-initialized", "true");
      const expires_at = Math.floor(Date.now() / 1000) + 3600;
      const access_token = `${btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${btoa(JSON.stringify({ sub: user.id, exp: expires_at, role: "authenticated" }))}.signature`;
      localStorage.setItem("sb-audit-auth-token", JSON.stringify({ access_token, refresh_token: "audit-refresh", expires_at, expires_in: 3600, token_type: "bearer", user }));
    }, { user });
  }
}

test("student tabs survive reload and back/forward, and logout removes access", async ({ page }) => {
  await prepare(page, "user", "free");
  await page.goto("/dashboard?tab=tests");
  await expect(page.getByText("Numerical Practice", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("Numerical Practice", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: /modules/i }).first().click();
  await expect(page).toHaveURL(/tab=modules/);
  await page.goBack();
  await expect(page).toHaveURL(/tab=tests/);
  await page.goForward();
  await expect(page).toHaveURL(/tab=modules/);
  await expect(page.getByRole("button", { name: "Log out" })).toBeInViewport();
  await page.getByRole("button", { name: "Log out" }).click();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/signup\?mode=login/);
});

test("practice test loads, retains answers on reload, and handles missing links", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await prepare(page);
  await page.goto("/test/numerical");
  await page.getByRole("button", { name: /start/i }).first().click();
  await page.getByRole("button", { name: /Four/ }).click();
  await expect(page.getByRole("button", { name: "Submit (1/2)" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Submit (1/2)" })).toBeVisible();
  await page.goto("/test/missing");
  await expect(page.getByText("Test not found", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("admin tabs and dialogs render within the viewport", async ({ page }, testInfo) => {
  await prepare(page, "admin");
  await page.goto("/admin?tab=users");
  await expect(page.getByRole("heading", { name: "Manage course content, tests, and users" })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/tab=users/);
  await page.getByRole("button", { name: "Modules", exact: true }).click();
  await page.getByRole("button", { name: "New", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("admin-dialog.png") });
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
});

test("landing navigation is reachable on phone, tablet, and desktop", async ({ page }) => {
  await prepare(page, "user", "free", false);
  await page.goto("/");
  if (page.viewportSize()!.width < 1024) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.locator("#mobile-navigation").getByRole("link", { name: "Modules", exact: true })).toBeVisible();
  } else {
    await expect(page.locator("nav").getByRole("link", { name: "Modules", exact: true })).toBeVisible();
  }
});


test("pages have no horizontally clipped controls", async ({ page }, testInfo) => {
  await prepare(page, "admin");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/dashboard", "/module/1", "/module/1/lesson/0", "/signup?step=plan", "/admin"]) {
    await page.goto(path);
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`${path.split("?")[0].replaceAll("/", "_")}.png`), fullPage: true });
    const clipped = await page.locator("button, input, select, textarea").evaluateAll((elements) => elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > window.innerWidth + 1);
    }).map((element) => element.textContent?.trim().slice(0, 50) || element.tagName));
    expect(clipped, path).toEqual([]);
  }
  expect(errors).toEqual([]);
});


test("public SEO metadata and sitemap match the canonical homepage", async ({ page, request }) => {
  await prepare(page, "user", "free", false);
  await page.goto("/?utm_source=audit");
  await expect(page).toHaveTitle("RCMP Practice Tests & Entrance Assessment Prep | AptitudeForge");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.aptitudeforge.ca/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
  await expect(page.locator("h1")).toContainText("RCMP test prep.");
  await expect(page.getByRole("heading", { name: "RCMP practice tests: preparation questions" })).toBeVisible();
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("<loc>https://www.aptitudeforge.ca/</loc>");
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://www.aptitudeforge.ca/sitemap.xml");
  const schema = JSON.parse(await page.locator("#site-structured-data").textContent() || "{}");
  expect(schema["@graph"].map((node: { "@type": string }) => node["@type"])).toEqual(["Organization", "WebSite"]);
  await page.locator("#preparation-faq").getByRole("link", { name: "Create a free account" }).click();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Back to site" }).click();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
});

test("homepage content renders while account restoration is stalled", async ({ page }) => {
  await prepare(page);
  await page.route("https://audit.supabase.co/rest/v1/profiles**", () => {});
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("RCMP test prep.");
  await expect(page.getByRole("heading", { name: "RCMP practice tests: preparation questions" })).toBeVisible();
});
