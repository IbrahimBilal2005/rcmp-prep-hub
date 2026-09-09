import { beforeEach, expect, it } from "vitest";
import type { PracticeTest } from "@/data/courseData";
import { practiceFingerprint, readPracticeSession, remainingPracticeSeconds, savePracticeSession } from "./practiceSession";

const test = { id: "numerical", time: 15, testQuestions: [{ id: 1, question: "2+2?", correctIndex: 0, correctIndexes: [0], options: [{ text: "4", imagePath: "option.png", imageUrl: "signed-old" }] }] } as PracticeTest;
beforeEach(() => sessionStorage.clear());
it("uses wall-clock elapsed time after sleep and clamps expired timers to zero", () => {
  const start = "2026-09-09T12:00:00Z";
  expect(remainingPracticeSeconds(start, 15, Date.parse(start) + 10 * 60_000)).toBe(300);
  expect(remainingPracticeSeconds(start, 15, Date.parse(start) + 16 * 60_000)).toBe(0);
});
it("restores answers only for the same user and unchanged test content", () => {
  const draft = { phase: "active" as const, currentQ: 0, answers: [0], startedAt: new Date().toISOString(), reviewMeta: null, fingerprint: practiceFingerprint(test) };
  savePracticeSession("user-a", test.id, draft);
  expect(readPracticeSession("user-a", test)?.answers).toEqual([0]);
  expect(readPracticeSession("user-b", test)).toBeNull();
  expect(readPracticeSession("user-a", { ...test, time: 30 })).toBeNull();
  const refreshed = structuredClone(test);
  refreshed.testQuestions[0].options[0].imageUrl = "signed-new";
  expect(readPracticeSession("user-a", refreshed)?.answers).toEqual([0]);
});
it("ignores malformed saved answers", () => {
  savePracticeSession("user-a", test.id, { phase: "active", currentQ: 0, answers: [9], startedAt: new Date().toISOString(), reviewMeta: null, fingerprint: practiceFingerprint(test) });
  expect(readPracticeSession("user-a", test)).toBeNull();
});
