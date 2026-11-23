import { getAuthSession } from "@/lib/auth";

export const FREE_PREVIEW_MODULE_ID = 1;
// Fallback slug used only when no practice test is flagged with is_preview in the database.
export const FREE_PREVIEW_TEST_ID = "numerical";

export interface PreviewTestRef {
  id: string;
  isPreview?: boolean;
}

const isPreviewTest = (test: PreviewTestRef) => test.isPreview === true || test.id === FREE_PREVIEW_TEST_ID;

export const findPreviewTest = <T extends PreviewTestRef>(tests: T[]): T | undefined =>
  tests.find((test) => test.isPreview === true) ?? tests.find((test) => test.id === FREE_PREVIEW_TEST_ID);
export const FREE_PREVIEW_MODULE_LESSON_COUNT = 2;
export const FREE_PREVIEW_MODULE_QUIZ_QUESTION_COUNT = 2;
export const FREE_PREVIEW_TEST_QUESTION_COUNT = 3;

export const hasFullAccess = () => getAuthSession()?.plan === "premium";
export const isFreePreviewMode = () => !hasFullAccess();

export const canAccessModule = (moduleId: number, moduleIndex?: number) =>
  hasFullAccess() || (typeof moduleIndex === "number" ? moduleIndex === 0 : moduleId === FREE_PREVIEW_MODULE_ID);

export const canAccessTest = (test: PreviewTestRef) =>
  hasFullAccess() || isPreviewTest(test);

export const isPreviewLessonUnlocked = (moduleId: number, lessonIndex: number, moduleIndex?: number) =>
  hasFullAccess() ||
  ((typeof moduleIndex === "number" ? moduleIndex === 0 : moduleId === FREE_PREVIEW_MODULE_ID) &&
    lessonIndex < FREE_PREVIEW_MODULE_LESSON_COUNT);

export const isPreviewModuleQuizQuestionUnlocked = (moduleId: number, questionIndex: number, moduleIndex?: number) =>
  hasFullAccess() ||
  ((typeof moduleIndex === "number" ? moduleIndex === 0 : moduleId === FREE_PREVIEW_MODULE_ID) &&
    questionIndex < FREE_PREVIEW_MODULE_QUIZ_QUESTION_COUNT);

export const isPreviewTestQuestionUnlocked = (test: PreviewTestRef, questionIndex: number) =>
  hasFullAccess() || (isPreviewTest(test) && questionIndex < FREE_PREVIEW_TEST_QUESTION_COUNT);

export const canViewDetailedAnswerFeedback = () => hasFullAccess();
