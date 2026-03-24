export interface ModuleProgressRecord {
  moduleId: number;
  started: boolean;
  lastLessonIndex: number | null;
  completedLessons: number[];
  quizStarted: boolean;
  quizCompleted: boolean;
  quizScore: number | null;
  quizTotal: number | null;
  updatedAt: string;
}

const STORAGE_KEY = "aptitudeforge.module-progress";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readProgressMap = (): Record<number, ModuleProgressRecord> => {
  if (!canUseStorage()) {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeProgressMap = (progressMap: Record<number, ModuleProgressRecord>) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
};

export const replaceAllModuleProgress = (progressMap: Record<number, ModuleProgressRecord>) => {
  writeProgressMap(progressMap);
};

export const clearModuleProgress = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};

export const getAllModuleProgress = () => readProgressMap();

export const getModuleProgress = (moduleId: number): ModuleProgressRecord | null =>
  readProgressMap()[moduleId] ?? null;

export const isModuleFullyCompleted = (
  progress: ModuleProgressRecord | null | undefined,
  lessonCount: number,
) => {
  if (!progress) {
    return false;
  }

  const completedAllLessons = progress.completedLessons.length === lessonCount;
  const earnedPerfectQuizScore =
    progress.quizCompleted &&
    progress.quizScore !== null &&
    progress.quizTotal !== null &&
    progress.quizTotal > 0 &&
    progress.quizScore === progress.quizTotal;

  return completedAllLessons && earnedPerfectQuizScore;
};

export const upsertModuleProgress = (
  moduleId: number,
  updater: (current: ModuleProgressRecord) => ModuleProgressRecord,
) => {
  const progressMap = readProgressMap();
  const current =
    progressMap[moduleId] ?? {
      moduleId,
      started: false,
      lastLessonIndex: null,
      completedLessons: [],
      quizStarted: false,
      quizCompleted: false,
      quizScore: null,
      quizTotal: null,
      updatedAt: new Date(0).toISOString(),
    };

  progressMap[moduleId] = updater(current);
  writeProgressMap(progressMap);
  return progressMap[moduleId];
};
