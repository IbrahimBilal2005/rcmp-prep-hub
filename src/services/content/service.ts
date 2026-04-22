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
  module_quiz_questions: QuestionRow[] | null;
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

interface QuestionRow {
  id: number;
  question: string;
  question_image_path: string | null;
  options: unknown[] | null;
  correct_index: number | null;
  correct_indexes: number[] | null;
  explanation: string;
  sort_order: number;
}

interface PracticeTestRow {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  time_limit_minutes: number;
  practice_test_questions: QuestionRow[] | null;
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
    explanation: question.explanation,
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

const mapModule = async (module: ModuleRow): Promise<ModuleInfo> => ({
  id: module.id,
  slug: module.slug,
  icon: moduleIconBySlug[module.slug] ?? defaultModuleIcon,
  title: module.title,
  description: module.description,
  lessons: [...(module.lessons ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((lesson, index) => mapLesson(lesson, index)),
  quiz: await Promise.all(
    [...(module.module_quiz_questions ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapQuestion),
  ),
});

const mapPracticeTest = async (test: PracticeTestRow): Promise<PracticeTest> => ({
  id: test.slug,
  dbId: test.id,
  slug: test.slug,
  title: test.title,
  description: test.description,
  questions: test.practice_test_questions?.length ?? 0,
  time: test.time_limit_minutes,
  category: test.category,
  icon: practiceTestIconBySlug[test.slug] ?? defaultPracticeTestIcon,
  testQuestions: await Promise.all(
    [...(test.practice_test_questions ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapQuestion),
  ),
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

    const [{ data: moduleRows, error: moduleError }, { data: practiceTestRows, error: practiceTestError }] = await Promise.all([
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
          ),
          module_quiz_questions (
            id,
            question,
            question_image_path,
            options,
            correct_index,
            correct_indexes,
            explanation,
            sort_order
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
          practice_test_questions (
            id,
            question,
            question_image_path,
            options,
            correct_index,
            correct_indexes,
            explanation,
            sort_order
          )
        `)
        .order("sort_order", { ascending: true }),
    ]);

    if (moduleError || practiceTestError || !moduleRows || !practiceTestRows) {
      const errorMessage =
        moduleError?.message ||
        practiceTestError?.message ||
        "Supabase returned no rows for one or more content queries.";

      console.error("Failed to fetch course content from Supabase", {
        moduleError,
        practiceTestError,
        moduleRows,
        practiceTestRows,
      });

      return {
        ...getEmptyCourseContent(),
        error: errorMessage,
      };
    }

    return {
      modules: await Promise.all([...moduleRows].sort((a, b) => a.sort_order - b.sort_order).map(mapModule)),
      practiceTests: await Promise.all(practiceTestRows.map(mapPracticeTest)),
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
