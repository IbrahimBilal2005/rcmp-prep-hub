import { describe, expect, it } from "vitest";
import { canAccessTest, findPreviewTest, isPreviewTestQuestionUnlocked } from "@/lib/access";

// No auth session is stored in these tests, so every check runs as a free-plan user.
const tests = [
  { id: "language-comprehension-practice", isPreview: true },
  { id: "numerical-skills-practice", isPreview: false },
];

describe("free practice test access", () => {
  it("unlocks the test flagged is_preview in the database", () => {
    expect(canAccessTest(tests[0])).toBe(true);
    expect(canAccessTest(tests[1])).toBe(false);
    expect(findPreviewTest(tests)?.id).toBe("language-comprehension-practice");
  });

  it("limits free users to the first preview questions", () => {
    expect(isPreviewTestQuestionUnlocked(tests[0], 0)).toBe(true);
    expect(isPreviewTestQuestionUnlocked(tests[0], 3)).toBe(false);
    expect(isPreviewTestQuestionUnlocked(tests[1], 0)).toBe(false);
  });

  it("falls back to the legacy numerical slug when no test is flagged", () => {
    expect(canAccessTest({ id: "numerical" })).toBe(true);
    expect(findPreviewTest([{ id: "numerical" }, { id: "memory" }])?.id).toBe("numerical");
  });
});
