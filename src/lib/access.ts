import { getAuthSession } from "@/lib/auth";

export const FREE_PREVIEW_MODULE_ID = 1;
export const FREE_PREVIEW_TEST_ID = "numerical";
export const FREE_PREVIEW_MODULE_LESSON_COUNT = 2;
export const FREE_PREVIEW_MODULE_QUIZ_QUESTION_COUNT = 2;
export const FREE_PREVIEW_TEST_QUESTION_COUNT = 3;

export const hasFullAccess = () => getAuthSession()?.plan === "premium";
export const isFreePreviewMode = () => !hasFullAccess();

export const canAccessModule = (moduleId: number, moduleIndex?: number) =>
  hasFullAccess() || (typeof moduleIndex === "number" ? moduleIndex === 0 : moduleId === FREE_PREVIEW_MODULE_ID);

export const canAccessTest = (testId: string) =>
  hasFullAccess() || testId === FREE_PREVIEW_TEST_ID;

export const isPreviewLessonUnlocked = (moduleId: number, lessonIndex: number, moduleIndex?: number) =>
  hasFullAccess() ||
  ((typeof moduleIndex === "number" ? moduleIndex === 0 : moduleId === FREE_PREVIEW_MODULE_ID) &&
    lessonIndex < FREE_PREVIEW_MODULE_LESSON_COUNT);

export const isPreviewModuleQuizQuestionUnlocked = (moduleId: number, questionIndex: number, moduleIndex?: number) =>
  hasFullAccess() ||
  ((typeof moduleIndex === "number" ? moduleIndex === 0 : moduleId === FREE_PREVIEW_MODULE_ID) &&
    questionIndex < FREE_PREVIEW_MODULE_QUIZ_QUESTION_COUNT);

export const isPreviewTestQuestionUnlocked = (testId: string, questionIndex: number) =>
  hasFullAccess() || (testId === FREE_PREVIEW_TEST_ID && questionIndex < FREE_PREVIEW_TEST_QUESTION_COUNT);

export const canViewDetailedAnswerFeedback = () => hasFullAccess();
