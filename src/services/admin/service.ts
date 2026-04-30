import type { ModuleInfo, ModuleLesson, PracticeTest, QuizQuestion } from "@/data/courseData";
import { getCorrectIndexes, getPrimaryCorrectIndex } from "@/lib/quiz";
import { supabase } from "@/services/supabase/client";

export type AdminUserStatus = "active" | "invited" | "suspended";

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  plan: "free" | "premium";
  status: AdminUserStatus;
  modulesCompleted: number;
  testAttempts: number;
  lastSeen: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "user" | "admin" | null;
  plan: "free" | "premium" | null;
  status: AdminUserStatus | null;
  created_at: string | null;
}

interface ModuleProgressRow {
  user_id: string;
  completed_lessons: number;
  lessons_total: number;
  updated_at: string;
}

interface PracticeAttemptRow {
  user_id: string;
  submitted_at: string;
}

const requireSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase client is not initialized.");
  }

  return supabase;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseDurationMinutes = (duration: string) => {
  const minutes = Number.parseInt(duration, 10);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 10;
};

const serializeQuestionOptions = (options: QuizQuestion["options"]) =>
  options.map((option) => ({
    text: option.text.trim(),
    image_path: option.imagePath?.trim() || null,
  }));

const formatLastSeen = (dateString: string | null) => {
  if (!dateString) {
    return "No activity yet";
  }

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
};

const getLatestTimestamp = (...timestamps: Array<string | null | undefined>) =>
  timestamps
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

const getNextSortOrder = async (
  table: "modules" | "practice_tests" | "lessons" | "module_quiz_questions" | "practice_test_questions",
  filterColumn?: string,
  filterValue?: number,
) => {
  const client = requireSupabase();
  let query = client.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);

  if (filterColumn && typeof filterValue === "number") {
    query = query.eq(filterColumn, filterValue);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data?.sort_order ?? -1) + 1;
};

const ensureTouchedRow = (row: unknown, action: string) => {
  if (!row) {
    throw new Error(`${action} did not update any rows. Confirm this record still exists and your admin session has permission.`);
  }
};

const getPatchedCorrectnessContext = (patch: Partial<QuizQuestion>) => {
  if (Array.isArray(patch.options)) {
    return {
      options: patch.options,
      correctIndex: patch.correctIndex ?? null,
      correctIndexes: patch.correctIndexes ?? [],
    } as QuizQuestion;
  }

  const indexes = Array.isArray(patch.correctIndexes)
    ? patch.correctIndexes.filter((value): value is number => Number.isInteger(value))
    : typeof patch.correctIndex === "number"
      ? [patch.correctIndex]
      : [];
  const optionCount = indexes.length > 0 ? Math.max(...indexes) + 1 : 0;

  return {
    options: Array.from({ length: optionCount }, () => ({ text: "", imagePath: null, imageUrl: null })),
    correctIndex: patch.correctIndex ?? indexes[0] ?? null,
    correctIndexes: indexes,
  } as QuizQuestion;
};

export const fetchAdminUsers = async (): Promise<AdminUserRecord[]> => {
  const client = requireSupabase();
  const [{ data: profiles, error: profileError }, { data: moduleProgress, error: moduleProgressError }, { data: attempts, error: attemptError }] =
    await Promise.all([
      client.from("profiles").select("id, email, full_name, role, plan, status, created_at").order("created_at", { ascending: true }),
      client.from("user_module_progress").select("user_id, completed_lessons, lessons_total, updated_at"),
      client.from("practice_test_attempts").select("user_id, submitted_at"),
    ]);

  if (profileError) {
    throw new Error(profileError.message || "Failed to load admin users.");
  }

  const progressByUser = new Map<string, ModuleProgressRow[]>();
  (moduleProgressError ? [] : (moduleProgress as ModuleProgressRow[])).forEach((row) => {
    const next = progressByUser.get(row.user_id) ?? [];
    next.push(row);
    progressByUser.set(row.user_id, next);
  });

  const attemptsByUser = new Map<string, PracticeAttemptRow[]>();
  (attemptError ? [] : (attempts as PracticeAttemptRow[])).forEach((row) => {
    const next = attemptsByUser.get(row.user_id) ?? [];
    next.push(row);
    attemptsByUser.set(row.user_id, next);
  });

  return (profiles as ProfileRow[])
    .filter((profile) => profile.role !== "admin")
    .map((profile) => {
      const userProgress = progressByUser.get(profile.id) ?? [];
      const userAttempts = attemptsByUser.get(profile.id) ?? [];
      const completedModules = userProgress.filter(
        (row) => row.lessons_total > 0 && row.completed_lessons >= row.lessons_total,
      ).length;
      const latestActivity = getLatestTimestamp(
        profile.created_at,
        ...userProgress.map((row) => row.updated_at),
        ...userAttempts.map((row) => row.submitted_at),
      );

      return {
        id: profile.id,
        name: profile.full_name?.trim() || "AptitudeForge User",
        email: profile.email?.trim() || "No email",
        plan: profile.plan === "premium" ? "premium" : "free",
        status: profile.status ?? "active",
        modulesCompleted: completedModules,
        testAttempts: userAttempts.length,
        lastSeen: formatLastSeen(latestActivity),
      };
    });
};

export const createModule = async (draft: { title: string; description: string }) => {
  const client = requireSupabase();
  const sortOrder = await getNextSortOrder("modules");
  const baseSlug = slugify(draft.title) || `module-${Date.now()}`;
  const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;
  const { error } = await client.from("modules").insert({
    slug,
    title: draft.title.trim() || "New Module",
    description: draft.description.trim() || "Add a focused module description for the training dashboard.",
    sort_order: sortOrder,
    is_published: true,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const updateModule = async (moduleId: number, patch: Partial<ModuleInfo>) => {
  const client = requireSupabase();
  const updates: Record<string, string> = {};

  if (typeof patch.title === "string") {
    updates.title = patch.title.trim();
  }

  if (typeof patch.description === "string") {
    updates.description = patch.description.trim();
  }

  const { data, error } = await client.from("modules").update(updates).eq("id", moduleId).select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  ensureTouchedRow(data, "Module update");
};

export const deleteModule = async (moduleId: number) => {
  const client = requireSupabase();
  const { data, error } = await client.from("modules").delete().eq("id", moduleId).select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  ensureTouchedRow(data, "Module delete");
};

export const createLesson = async (moduleId: number, draft: ModuleLesson) => {
  const client = requireSupabase();
  const sortOrder = await getNextSortOrder("lessons", "module_id", moduleId);
  const { error } = await client.from("lessons").insert({
    module_id: moduleId,
    title: draft.title.trim() || "New Lesson",
    chapter_label: draft.chapterLabel.trim() || null,
    summary: draft.summary.trim() || "Add the lesson overview and outcomes.",
    duration_minutes: parseDurationMinutes(draft.duration),
    sort_order: sortOrder,
    video_path: draft.videoUrl?.trim() || null,
    poster_path: draft.posterUrl?.trim() || null,
    is_preview: false,
    is_published: true,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const updateLesson = async (lessonId: number, patch: Partial<ModuleLesson>) => {
  const client = requireSupabase();
  const updates: Record<string, string | number | null> = {};

  if (typeof patch.title === "string") {
    updates.title = patch.title.trim();
  }

  if (typeof patch.duration === "string") {
    updates.duration_minutes = parseDurationMinutes(patch.duration);
  }

  if (typeof patch.summary === "string") {
    updates.summary = patch.summary.trim();
  }

  if (typeof patch.chapterLabel === "string") {
    updates.chapter_label = patch.chapterLabel.trim() || null;
  }

  if ("videoUrl" in patch) {
    updates.video_path = patch.videoUrl?.trim() || null;
  }

  if ("posterUrl" in patch) {
    updates.poster_path = patch.posterUrl?.trim() || null;
  }

  const { data, error } = await client.from("lessons").update(updates).eq("id", lessonId).select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  ensureTouchedRow(data, "Lecture update");
};

export const deleteLesson = async (lessonId: number) => {
  const client = requireSupabase();
  const { data, error } = await client.from("lessons").delete().eq("id", lessonId).select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  ensureTouchedRow(data, "Lecture delete");
};

export const createModuleQuestion = async (moduleId: number, draft: QuizQuestion) => {
  const client = requireSupabase();
  
  // Validate required fields before creating - but allow placeholder text for new questions
  if (!draft.question?.trim() || draft.question.trim() === "Add a new question prompt.") {
    throw new Error("Please enter a question prompt before creating.");
  }

  if (!Array.isArray(draft.options) || draft.options.length < 2) {
    throw new Error("Question must have at least 2 options.");
  }

  const hasValidOption = draft.options.some((opt) => opt.text?.trim() && opt.text.trim() !== `Option ${String.fromCharCode(65 + draft.options.indexOf(opt))}`);
  if (!hasValidOption) {
    throw new Error("At least one option must have custom text (not just the default placeholder).");
  }

  if (!draft.explanation?.trim() || draft.explanation === "Write the explanation learners should see after answering.") {
    throw new Error("Please enter an explanation before creating.");
  }

  const correctIndexes = getCorrectIndexes(draft);
  if (correctIndexes.length === 0) {
    throw new Error("At least one correct answer must be marked.");
  }

  const sortOrder = await getNextSortOrder("module_quiz_questions", "module_id", moduleId);
  const { error } = await client.from("module_quiz_questions").insert({
    module_id: moduleId,
    question: draft.question.trim() || "Add a new question prompt.",
    question_image_path: draft.questionImagePath?.trim() || null,
    options: serializeQuestionOptions(draft.options),
    correct_index: getPrimaryCorrectIndex(draft),
    correct_indexes: correctIndexes,
    explanation: draft.explanation.trim() || "Add the explanation for this question.",
    sort_order: sortOrder,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const updateModuleQuestion = async (questionId: number, patch: Partial<QuizQuestion>) => {
  const client = requireSupabase();
  const updates: Record<string, string | number | number[] | object[] | null> = {};

  // Always update all fields to ensure data consistency
  if ("question" in patch) {
    updates.question = typeof patch.question === "string" ? patch.question.trim() : "Add a new question prompt.";
  }

  if (Array.isArray(patch.options)) {
    updates.options = serializeQuestionOptions(patch.options);
  }

  if ("questionImagePath" in patch) {
    updates.question_image_path = patch.questionImagePath?.trim() || null;
  }

  if ("correctIndex" in patch || "correctIndexes" in patch || Array.isArray(patch.correctIndexes)) {
    const nextQuestion = getPatchedCorrectnessContext(patch);
    updates.correct_index = getPrimaryCorrectIndex(nextQuestion);
    updates.correct_indexes = getCorrectIndexes(nextQuestion);
  }

  if ("explanation" in patch) {
    updates.explanation = typeof patch.explanation === "string" ? patch.explanation.trim() : "Add the explanation for this question.";
  }

  // If no updates were prepared, this is a no-op but should not error
  if (Object.keys(updates).length === 0) {
    // Fetch the current record to ensure it exists
    const { data: existingQuestion, error: fetchError } = await client
      .from("module_quiz_questions")
      .select("id")
      .eq("id", questionId)
      .maybeSingle();

    if (fetchError || !existingQuestion) {
      throw new Error("Module question not found or unable to verify.");
    }

    return; // No updates needed
  }

  const { count, error } = await client.from("module_quiz_questions").update(updates, { count: "exact" }).eq("id", questionId);

  if (error) {
    throw new Error(error.message);
  }

  ensureTouchedRow(count, "Module question update");
};

export const deleteModuleQuestion = async (questionId: number) => {
  const client = requireSupabase();
  const { data, error } = await client.from("module_quiz_questions").delete().eq("id", questionId).select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  ensureTouchedRow(data, "Module question delete");
};

export const createPracticeTest = async (draft: { title: string; description: string; category: string; time: number }) => {
  const client = requireSupabase();
  const sortOrder = await getNextSortOrder("practice_tests");
  const baseSlug = slugify(draft.title) || `practice-test-${Date.now()}`;
  const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;
  const { error } = await client.from("practice_tests").insert({
    slug,
    title: draft.title.trim() || "New Practice Test",
    description: draft.description.trim() || "Add the test overview, timing goals, and what this set is designed to measure.",
    category: draft.category.trim() || "General",
    time_limit_minutes: draft.time,
    sort_order: sortOrder,
    is_preview: false,
    is_published: true,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const updatePracticeTest = async (testId: number, patch: Partial<PracticeTest>) => {
  const client = requireSupabase();
  const updates: Record<string, string | number> = {};

  if (typeof patch.title === "string") {
    updates.title = patch.title.trim();
  }

  if (typeof patch.description === "string") {
    updates.description = patch.description.trim();
  }

  if (typeof patch.category === "string") {
    updates.category = patch.category.trim();
  }

  if (typeof patch.time === "number") {
    updates.time_limit_minutes = patch.time;
  }

  const { data, error } = await client.from("practice_tests").update(updates).eq("id", testId).select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  ensureTouchedRow(data, "Practice test update");
};

export const deletePracticeTest = async (testId: number) => {
  const client = requireSupabase();
  const { data, error } = await client.from("practice_tests").delete().eq("id", testId).select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  ensureTouchedRow(data, "Practice test delete");
};

export const createPracticeTestQuestion = async (testId: number, draft: QuizQuestion) => {
  const client = requireSupabase();
  
  // Validate required fields before creating - but allow placeholder text for new questions
  if (!draft.question?.trim() || draft.question.trim() === "Add a new question prompt.") {
    throw new Error("Please enter a question prompt before creating.");
  }

  if (!Array.isArray(draft.options) || draft.options.length < 2) {
    throw new Error("Question must have at least 2 options.");
  }

  const hasValidOption = draft.options.some((opt) => opt.text?.trim() && opt.text.trim() !== `Option ${String.fromCharCode(65 + draft.options.indexOf(opt))}`);
  if (!hasValidOption) {
    throw new Error("At least one option must have custom text (not just the default placeholder).");
  }

  if (!draft.explanation?.trim() || draft.explanation === "Write the explanation learners should see after answering.") {
    throw new Error("Please enter an explanation before creating.");
  }

  const correctIndexes = getCorrectIndexes(draft);
  if (correctIndexes.length === 0) {
    throw new Error("At least one correct answer must be marked.");
  }

  const sortOrder = await getNextSortOrder("practice_test_questions", "practice_test_id", testId);
  const { error } = await client.from("practice_test_questions").insert({
    practice_test_id: testId,
    question: draft.question.trim() || "Add a new question prompt.",
    question_image_path: draft.questionImagePath?.trim() || null,
    options: serializeQuestionOptions(draft.options),
    correct_index: getPrimaryCorrectIndex(draft),
    correct_indexes: correctIndexes,
    explanation: draft.explanation.trim() || "Add the explanation for this question.",
    sort_order: sortOrder,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const updatePracticeTestQuestion = async (questionId: number, patch: Partial<QuizQuestion>) => {
  const client = requireSupabase();
  const updates: Record<string, string | number | number[] | object[] | null> = {};

  // Always update all fields to ensure data consistency
  if ("question" in patch) {
    updates.question = typeof patch.question === "string" ? patch.question.trim() : "Add a new question prompt.";
  }

  if (Array.isArray(patch.options)) {
    updates.options = serializeQuestionOptions(patch.options);
  }

  if ("questionImagePath" in patch) {
    updates.question_image_path = patch.questionImagePath?.trim() || null;
  }

  if ("correctIndex" in patch || "correctIndexes" in patch || Array.isArray(patch.correctIndexes)) {
    const nextQuestion = getPatchedCorrectnessContext(patch);
    updates.correct_index = getPrimaryCorrectIndex(nextQuestion);
    updates.correct_indexes = getCorrectIndexes(nextQuestion);
  }

  if ("explanation" in patch) {
    updates.explanation = typeof patch.explanation === "string" ? patch.explanation.trim() : "Add the explanation for this question.";
  }

  // If no updates were prepared, this is a no-op but should not error
  if (Object.keys(updates).length === 0) {
    // Fetch the current record to ensure it exists
    const { data: existingQuestion, error: fetchError } = await client
      .from("practice_test_questions")
      .select("id")
      .eq("id", questionId)
      .maybeSingle();

    if (fetchError || !existingQuestion) {
      throw new Error("Practice test question not found or unable to verify.");
    }

    return; // No updates needed
  }

  const { count, error } = await client.from("practice_test_questions").update(updates, { count: "exact" }).eq("id", questionId);

  if (error) {
    throw new Error(error.message);
  }

  ensureTouchedRow(count, "Practice test question update");
};

export const deletePracticeTestQuestion = async (questionId: number) => {
  const client = requireSupabase();
  const { data, error } = await client.from("practice_test_questions").delete().eq("id", questionId).select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  ensureTouchedRow(data, "Practice test question delete");
};

export const updateAdminUser = async (
  userId: string,
  patch: Partial<Pick<AdminUserRecord, "plan" | "status">>,
) => {
  const client = requireSupabase();
  const updates: Record<string, string | null> = {};

  if (patch.plan) {
    updates.plan = patch.plan;
    if (patch.plan === "premium") {
      const accessExpiresAt = new Date();
      accessExpiresAt.setUTCMonth(accessExpiresAt.getUTCMonth() + 6);
      updates.access_expires_at = accessExpiresAt.toISOString();
    }

    if (patch.plan === "free") {
      updates.access_expires_at = null;
    }
  }

  if (patch.status) {
    updates.status = patch.status;
  }

  const { data, error } = await client.from("profiles").update(updates).eq("id", userId).select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  ensureTouchedRow(data, "User update");
};

export const deleteAdminUser = async (userId: string) => {
  const client = requireSupabase();
  const { error } = await client.functions.invoke("admin-delete-user", {
    body: { userId },
  });

  if (error) {
    throw new Error(error.message);
  }
};
