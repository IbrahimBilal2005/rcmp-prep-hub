export interface PracticeAttemptRecord {
  id: string;
  testId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  timedOut: boolean;
  answers: Array<number | null>;
}

const STORAGE_KEY = "aptitudeforge.practice-attempts";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readAttempts = (): PracticeAttemptRecord[] => {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAttempts = (attempts: PracticeAttemptRecord[]) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
};

export const getPracticeAttempts = (testId: string) =>
  readAttempts()
    .filter((attempt) => attempt.testId === testId)
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));

export const getPracticeAttemptCount = (testId: string) => getPracticeAttempts(testId).length;

export const getBestPracticeAttempt = (testId: string) =>
  getPracticeAttempts(testId).reduce<PracticeAttemptRecord | null>((best, attempt) => {
    if (!best) {
      return attempt;
    }

    if (attempt.percentage > best.percentage) {
      return attempt;
    }

    if (attempt.percentage === best.percentage && attempt.durationSeconds < best.durationSeconds) {
      return attempt;
    }

    return best;
  }, null);

export const getTotalPracticeAttempts = () => readAttempts().length;

export const savePracticeAttempt = (attempt: PracticeAttemptRecord) => {
  const attempts = readAttempts();
  attempts.push(attempt);
  writeAttempts(attempts);
};

export const clearPracticeAttempts = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
