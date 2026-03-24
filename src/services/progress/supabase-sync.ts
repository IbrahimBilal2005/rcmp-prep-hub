import { appConfig } from "@/config/app";
import {
  clearModuleProgress,
  replaceAllModuleProgress,
  type ModuleProgressRecord,
} from "@/lib/moduleProgressStorage";
import {
  clearPracticeAttempts,
  replacePracticeAttempts,
  type PracticeAttemptRecord,
} from "@/lib/practiceTestStorage";
import { getStoredAuthSession } from "@/services/auth/session-storage";
import { supabase } from "@/services/supabase/client";

interface ModuleProgressRow {
  module_id: number;
  started: boolean;
  last_lesson_index: number | null;
  quiz_started: boolean;
  quiz_completed: boolean;
  quiz_score: number | null;
  quiz_total: number | null;
  updated_at: string;
}

interface LessonCompletionRow {
  lesson_id: number;
  lessons: {
    module_id: number;
    sort_order: number;
  } | null;
}

interface PracticeAttemptRow {
  id: number;
  score: number;
  total_questions: number;
  duration_seconds: number;
  answers: Array<number | null> | null;
  submitted_at: string;
  started_at: string | null;
  timed_out: boolean | null;
  practice_tests: {
    slug: string;
  } | null;
}

const canSyncProgress = () => !appConfig.useMockAuth && Boolean(supabase);

const getCurrentUserId = async () => {
  const storedSession = getStoredAuthSession();
  if (storedSession?.id) {
    return storedSession.id;
  }

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user.id) {
    return null;
  }

  return data.session.user.id;
};

const getLessonRowsForModule = async (moduleId: number) => {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("lessons")
    .select("id, sort_order")
    .eq("module_id", moduleId)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    throw new Error(error?.message || "Unable to load lesson ids for progress sync.");
  }

  return data;
};

const getPracticeTestRowBySlug = async (slug: string) => {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("practice_tests")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const hydratePersistedProgress = async (userIdOverride?: string) => {
  if (!canSyncProgress() || !supabase) {
    return;
  }

  const userId = userIdOverride ?? (await getCurrentUserId());
  if (!userId) {
    clearModuleProgress();
    clearPracticeAttempts();
    return;
  }

  const [
    { data: moduleProgressRows, error: moduleProgressError },
    { data: lessonCompletionRows, error: lessonCompletionError },
    { data: practiceAttemptRows, error: practiceAttemptError },
  ] = await Promise.all([
    supabase
      .from("user_module_progress")
      .select("module_id, started, last_lesson_index, quiz_started, quiz_completed, quiz_score, quiz_total, updated_at")
      .eq("user_id", userId),
    supabase
      .from("lesson_completions")
      .select("lesson_id, lessons!inner(module_id, sort_order)")
      .eq("user_id", userId),
    supabase
      .from("practice_test_attempts")
      .select("id, score, total_questions, duration_seconds, answers, submitted_at, started_at, timed_out, practice_tests!inner(slug)")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false }),
  ]);

  if (moduleProgressError || lessonCompletionError || practiceAttemptError) {
    console.error("Failed to hydrate progress from Supabase", {
      moduleProgressError,
      lessonCompletionError,
      practiceAttemptError,
    });
    return;
  }

  const completionMap = (lessonCompletionRows ?? []).reduce<Record<number, number[]>>((acc, row) => {
    const completion = row as unknown as LessonCompletionRow;
    const moduleId = completion.lessons?.module_id;
    const sortOrder = completion.lessons?.sort_order;

    if (!moduleId || !sortOrder) {
      return acc;
    }

    acc[moduleId] = [...(acc[moduleId] ?? []), sortOrder - 1].sort((a, b) => a - b);
    return acc;
  }, {});

  const progressMap = (moduleProgressRows ?? []).reduce<Record<number, ModuleProgressRecord>>((acc, row) => {
    const progress = row as unknown as ModuleProgressRow;

    acc[progress.module_id] = {
      moduleId: progress.module_id,
      started: progress.started,
      lastLessonIndex: progress.last_lesson_index,
      completedLessons: completionMap[progress.module_id] ?? [],
      quizStarted: progress.quiz_started,
      quizCompleted: progress.quiz_completed,
      quizScore: progress.quiz_score,
      quizTotal: progress.quiz_total,
      updatedAt: progress.updated_at,
    };

    return acc;
  }, {});

  Object.entries(completionMap).forEach(([moduleId, completedLessons]) => {
    const numericModuleId = Number(moduleId);
    if (!progressMap[numericModuleId]) {
      progressMap[numericModuleId] = {
        moduleId: numericModuleId,
        started: completedLessons.length > 0,
        lastLessonIndex: completedLessons.length > 0 ? completedLessons[completedLessons.length - 1] : null,
        completedLessons,
        quizStarted: false,
        quizCompleted: false,
        quizScore: null,
        quizTotal: null,
        updatedAt: new Date(0).toISOString(),
      };
    } else {
      progressMap[numericModuleId].completedLessons = completedLessons;
    }
  });

  replaceAllModuleProgress(progressMap);

  const attempts = (practiceAttemptRows ?? []).map((row) => {
    const attempt = row as unknown as PracticeAttemptRow;
    return {
      id: String(attempt.id),
      testId: attempt.practice_tests?.slug ?? "",
      score: attempt.score,
      totalQuestions: attempt.total_questions,
      percentage: attempt.total_questions > 0 ? Math.round((attempt.score / attempt.total_questions) * 100) : 0,
      startedAt: attempt.started_at || attempt.submitted_at,
      completedAt: attempt.submitted_at,
      durationSeconds: attempt.duration_seconds,
      timedOut: Boolean(attempt.timed_out),
      answers: Array.isArray(attempt.answers) ? attempt.answers : [],
    } satisfies PracticeAttemptRecord;
  }).filter((attempt) => Boolean(attempt.testId));

  replacePracticeAttempts(attempts);
};

export const persistModuleProgress = async (record: ModuleProgressRecord) => {
  if (!canSyncProgress() || !supabase) {
    return;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return;
  }

  const { error: progressError } = await supabase
    .from("user_module_progress")
    .upsert(
      {
        user_id: userId,
        module_id: record.moduleId,
        started: record.started,
        last_lesson_index: record.lastLessonIndex,
        quiz_started: record.quizStarted,
        quiz_completed: record.quizCompleted,
        quiz_score: record.quizScore,
        quiz_total: record.quizTotal,
        updated_at: record.updatedAt,
      },
      { onConflict: "user_id,module_id" },
    );

  if (progressError) {
    console.error("Failed to persist module progress", progressError);
    return;
  }

  const lessonRows = await getLessonRowsForModule(record.moduleId);
  const completedLessonIds = lessonRows
    .filter((lesson) => record.completedLessons.includes(lesson.sort_order - 1))
    .map((lesson) => lesson.id);

  const { error: deleteError } = await supabase
    .from("lesson_completions")
    .delete()
    .eq("user_id", userId)
    .in("lesson_id", lessonRows.map((lesson) => lesson.id));

  if (deleteError) {
    console.error("Failed to reset lesson completions before sync", deleteError);
    return;
  }

  if (completedLessonIds.length > 0) {
    const { error: completionError } = await supabase
      .from("lesson_completions")
      .upsert(
        completedLessonIds.map((lessonId) => ({
          user_id: userId,
          lesson_id: lessonId,
          completed_at: record.updatedAt,
        })),
        { onConflict: "user_id,lesson_id" },
      );

    if (completionError) {
      console.error("Failed to persist lesson completions", completionError);
    }
  }
};

export const persistPracticeAttempt = async (attempt: PracticeAttemptRecord) => {
  if (!canSyncProgress() || !supabase) {
    return;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return;
  }

  const practiceTest = await getPracticeTestRowBySlug(attempt.testId);
  if (!practiceTest?.id) {
    console.error("Unable to find practice test row for persisted attempt", { testId: attempt.testId });
    return;
  }

  const { error } = await supabase
    .from("practice_test_attempts")
    .insert({
      user_id: userId,
      practice_test_id: practiceTest.id,
      score: attempt.score,
      total_questions: attempt.totalQuestions,
      duration_seconds: attempt.durationSeconds,
      answers: attempt.answers,
      submitted_at: attempt.completedAt,
      started_at: attempt.startedAt,
      timed_out: attempt.timedOut,
    });

  if (error) {
    console.error("Failed to persist practice attempt", error);
  }
};

export const persistModuleQuizAttempt = async (record: ModuleProgressRecord) => {
  if (!canSyncProgress() || !supabase || !record.quizCompleted) {
    return;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return;
  }

  const { error } = await supabase
    .from("module_quiz_attempts")
    .insert({
      user_id: userId,
      module_id: record.moduleId,
      score: record.quizScore ?? 0,
      total_questions: record.quizTotal ?? 0,
      submitted_at: record.updatedAt,
    });

  if (error) {
    console.error("Failed to persist module quiz attempt", error);
  }
};
