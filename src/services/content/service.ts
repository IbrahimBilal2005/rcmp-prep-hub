import { Brain, BookOpen, Calculator, FileText, Languages, Shapes, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ModuleInfo, ModuleLesson, PracticeTest, QuizOption, QuizQuestion } from "@/data/courseData";
import { supabase } from "@/services/supabase/client";
import { resolveQuestionAssetUrl } from "@/services/storage/question-assets";

type ContentSource = "empty" | "supabase";

export interface CourseContent {
  modules: ModuleInfo[];
  practiceTests: PracticeTest[];
  source: ContentSource;
  error: string | null;
}

interface ModuleRow {
  id: number;
  slug: string;
  title: string;
  description: string;
  sort_order: number;
  lessons: LessonRow[] | null;
}

interface LessonRow {
  id: number;
  title: string;
  chapter_label: string | null;
  summary: string;
  duration_minutes: number;
  sort_order: number;
  video_path: string | null;
  poster_path: string | null;
}

// One row from the get_course_questions() RPC. Answers and explanations are null unless the
// caller is entitled to them (full access, or a free preview question); see
// supabase/migrations/20261123160000_protect_answer_keys_and_videos.sql.
interface QuestionRow {
  kind: "module_quiz" | "practice_test";
  id: number;
  parent_id: number;
  question: string;
  question_image_path: string | null;
  options: unknown[] | null;
  correct_index: number | null;
  correct_indexes: number[] | null;
  explanation: string | null;
  sort_order: number;
}

const byQuestionOrder = (a: QuestionRow, b: QuestionRow) => a.sort_order - b.sort_order || a.id - b.id;

const groupQuestions = (rows: QuestionRow[], kind: QuestionRow["kind"]) => {
  const grouped = new Map<number, QuestionRow[]>();
  for (const row of rows) {
    if (row.kind !== kind) continue;
    const list = grouped.get(row.parent_id) ?? [];
    list.push(row);
    grouped.set(row.parent_id, list);
  }
  for (const list of grouped.values()) {
    list.sort(byQuestionOrder);
  }
  return grouped;
};

interface PracticeTestRow {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  time_limit_minutes: number;
  is_preview: boolean | null;
}

const moduleIconBySlug: Record<string, LucideIcon> = {
  "understanding-the-rcmp-aptitude-test": BookOpen,
  "numerical-skills": Calculator,
  "memory-observation": Brain,
  "spatial-reasoning": Shapes,
  "language-logical-reasoning": Languages,
  "full-practice-tests": FileText,
  "work-style-professional-judgment": Users,
};

const practiceTestIconBySlug: Record<string, LucideIcon> = {
  numerical: Calculator,
  memory: Brain,
  language: Languages,
  spatial: Shapes,
  "full-sim": FileText,
};

const defaultModuleIcon = BookOpen;
const defaultPracticeTestIcon = FileText;

const formatDuration = (minutes: number) => `${minutes} min`;

const normalizeOption = (option: unknown): QuizOption => {
  if (typeof option === "string") {
    return { text: option, imagePath: null, imageUrl: null };
  }

  if (option && typeof option === "object") {
    const entry = option as { text?: unknown; image_path?: unknown };
    return {
      text: typeof entry.text === "string" ? entry.text : "",
      imagePath: typeof entry.image_path === "string" ? entry.image_path : null,
      imageUrl: null,
    };
  }

  return { text: "", imagePath: null, imageUrl: null };
};

const mapQuestion = async (question: QuestionRow): Promise<QuizQuestion> => {
  const options = (Array.isArray(question.options) ? question.options : []).map(normalizeOption);
  const [questionImageUrl, optionImageUrls] = await Promise.all([
    resolveQuestionAssetUrl(question.question_image_path),
    Promise.all(options.map((option) => resolveQuestionAssetUrl(option.imagePath))),
  ]);

  return {
    id: question.id,
    question: question.question,
    questionImagePath: question.question_image_path,
    questionImageUrl,
    options: options.map((option, index) => ({
      ...option,
      imageUrl: optionImageUrls[index],
    })),
    correctIndex: question.correct_index,
    correctIndexes: Array.isArray(question.correct_indexes)
      ? question.correct_indexes.filter((value): value is number => Number.isInteger(value))
      : [],
    explanation: question.explanation ?? "",
  };
};

const mapLesson = (lesson: LessonRow, index: number): ModuleLesson => ({
  id: lesson.id,
  title: lesson.title,
  duration: formatDuration(lesson.duration_minutes),
  summary: lesson.summary,
  chapterLabel: lesson.chapter_label || `Lesson ${String(index + 1).padStart(2, "0")}`,
  videoUrl: lesson.video_path,
  posterUrl: lesson.poster_path,
});

const mapModule = async (module: ModuleRow, questions: QuestionRow[]): Promise<ModuleInfo> => ({
  id: module.id,
  slug: module.slug,
  sortOrder: module.sort_order,
  icon: moduleIconBySlug[module.slug] ?? defaultModuleIcon,
  title: module.title,
  description: module.description,
  lessons: [...(module.lessons ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((lesson, index) => mapLesson(lesson, index)),
  quiz: await Promise.all(questions.map(mapQuestion)),
});

const mapPracticeTest = async (test: PracticeTestRow, questions: QuestionRow[]): Promise<PracticeTest> => ({
  id: test.slug,
  dbId: test.id,
  slug: test.slug,
  title: test.title,
  description: test.description,
  questions: questions.length,
  time: test.time_limit_minutes,
  category: test.category,
  isPreview: test.is_preview === true,
  icon: practiceTestIconBySlug[test.slug] ?? defaultPracticeTestIcon,
  testQuestions: await Promise.all(questions.map(mapQuestion)),
});

export const getEmptyCourseContent = (): CourseContent => ({
  modules: [],
  practiceTests: [],
  source: "empty",
  error: null,
});

export const fetchCourseContent = async (): Promise<CourseContent> => {
  try {
    if (!supabase) {
      return {
        ...getEmptyCourseContent(),
        error: "Supabase client is not initialized. Restart Vite after updating .env and confirm VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are loaded.",
      };
    }

    const [
      { data: moduleRows, error: moduleError },
      { data: practiceTestRows, error: practiceTestError },
      { data: questionRows, error: questionError },
    ] = await Promise.all([
      supabase
        .from("modules")
        .select(`
          id,
          slug,
          title,
          description,
          sort_order,
          lessons (
            id,
            title,
            chapter_label,
            summary,
            duration_minutes,
            sort_order,
            video_path,
            poster_path
          )
        `)
        .order("sort_order", { ascending: true }),
      supabase
        .from("practice_tests")
        .select(`
          id,
          slug,
          title,
          description,
          category,
          time_limit_minutes,
          is_preview
        `)
        .order("sort_order", { ascending: true }),
      supabase.rpc("get_course_questions"),
    ]);

    if (moduleError || practiceTestError || questionError || !moduleRows || !practiceTestRows || !questionRows) {
      const errorMessage =
        moduleError?.message ||
        practiceTestError?.message ||
        questionError?.message ||
        "Supabase returned no rows for one or more content queries.";

      console.error("Failed to fetch course content from Supabase", {
        moduleError,
        practiceTestError,
        questionError,
        moduleRows,
        practiceTestRows,
      });

      return {
        ...getEmptyCourseContent(),
        error: errorMessage,
      };
    }

    const questions = questionRows as QuestionRow[];
    const quizByModule = groupQuestions(questions, "module_quiz");
    const questionsByTest = groupQuestions(questions, "practice_test");

    return {
      modules: await Promise.all(
        [...(moduleRows as ModuleRow[])]
          .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
          .map((module) => mapModule(module, quizByModule.get(module.id) ?? [])),
      ),
      practiceTests: await Promise.all(
        (practiceTestRows as PracticeTestRow[]).map((test) => mapPracticeTest(test, questionsByTest.get(test.id) ?? [])),
      ),
      source: "supabase",
      error: null,
    };
  } catch (error) {
    console.error("Unexpected Supabase content fetch failure", error);

    return {
      ...getEmptyCourseContent(),
      error: error instanceof Error ? error.message : "Unknown Supabase content fetch error.",
    };
  }
};
