import type { PracticeTest } from "@/data/courseData";

export interface PracticeSession {
  phase: "active" | "review";
  answers: Array<number | null>;
  currentQ: number;
  startedAt: string;
  reviewMeta: { completedAt: string; timedOut: boolean } | null;
  fingerprint: string;
}
export const practiceFingerprint = (test: PracticeTest) => JSON.stringify([test.time, test.testQuestions.map((q) =>
  [q.id, q.question, q.questionImagePath, q.correctIndex, q.correctIndexes, q.options.map((option) => [option.text, option.imagePath])])]);
export const remainingPracticeSeconds = (startedAt: string, minutes: number, now = Date.now()) =>
  Math.max(0, Math.min(minutes * 60, Math.ceil((Date.parse(startedAt) + minutes * 60_000 - now) / 1000)));
const key = (userId: string, testId: string) => `aptitudeforge.practice-session:${userId}:${testId}`;

export const readPracticeSession = (userId: string, test: PracticeTest): PracticeSession | null => {
  try {
    const draft = JSON.parse(sessionStorage.getItem(key(userId, test.id)) || "null") as PracticeSession | null;
    if (!draft || draft.fingerprint !== practiceFingerprint(test) || !["active", "review"].includes(draft.phase)
      || !Number.isFinite(Date.parse(draft.startedAt)) || !Array.isArray(draft.answers)
      || draft.answers.length !== test.testQuestions.length || !Number.isInteger(draft.currentQ)
      || draft.currentQ < 0 || draft.currentQ >= draft.answers.length
      || draft.answers.some((answer, index) => answer !== null && (!Number.isInteger(answer) || answer < 0 || answer >= test.testQuestions[index].options.length))
      || (draft.phase === "review" && (!draft.reviewMeta || !Number.isFinite(Date.parse(draft.reviewMeta.completedAt))))) return null;
    return draft;
  } catch { return null; }
};
export const savePracticeSession = (userId: string, testId: string, draft: PracticeSession | null) => {
  try {
    if (draft) sessionStorage.setItem(key(userId, testId), JSON.stringify(draft));
    else sessionStorage.removeItem(key(userId, testId));
  } catch { /* A full or disabled storage area must not interrupt the test. */ }
};
