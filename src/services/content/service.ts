import { Brain, BookOpen, Calculator, FileText, Languages, Shapes, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ModuleInfo, ModuleLesson, PracticeTest, QuizQuestion } from "@/data/courseData";
import { supabase } from "@/services/supabase/client";

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
  title: string;
  chapter_label: string | null;
  summary: string;
  duration_minutes: number;
  sort_order: number;
  video_path: string | null;
  poster_path: string | null;
}

interface QuestionRow {
  question: string;
  options: string[] | null;
  correct_index: number;
  explanation: string;
  sort_order: number;
}

interface PracticeTestRow {
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

const mapQuestion = (question: QuestionRow): QuizQuestion => ({
  question: question.question,
  options: Array.isArray(question.options) ? question.options : [],
  correctIndex: question.correct_index,
  explanation: question.explanation,
});

const mapLesson = (lesson: LessonRow, index: number): ModuleLesson => ({
  title: lesson.title,
  duration: formatDuration(lesson.duration_minutes),
  summary: lesson.summary,
  chapterLabel: lesson.chapter_label || `Lesson ${String(index + 1).padStart(2, "0")}`,
  videoUrl: lesson.video_path,
  posterUrl: lesson.poster_path,
});

const mapModule = (module: ModuleRow): ModuleInfo => ({
  id: module.id,
  icon: moduleIconBySlug[module.slug] ?? defaultModuleIcon,
  title: module.title,
  description: module.description,
  lessons: [...(module.lessons ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((lesson, index) => mapLesson(lesson, index)),
  quiz: [...(module.module_quiz_questions ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapQuestion),
});

const mapPracticeTest = (test: PracticeTestRow): PracticeTest => ({
  id: test.slug,
  title: test.title,
  description: test.description,
  questions: test.practice_test_questions?.length ?? 0,
  time: test.time_limit_minutes,
  category: test.category,
  icon: practiceTestIconBySlug[test.slug] ?? defaultPracticeTestIcon,
  testQuestions: [...(test.practice_test_questions ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapQuestion),
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
            title,
            chapter_label,
            summary,
            duration_minutes,
            sort_order,
            video_path,
            poster_path
          ),
          module_quiz_questions (
            question,
            options,
            correct_index,
            explanation,
            sort_order
          )
        `)
        .order("sort_order", { ascending: true }),
      supabase
        .from("practice_tests")
        .select(`
          slug,
          title,
          description,
          category,
          time_limit_minutes,
          practice_test_questions (
            question,
            options,
            correct_index,
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
      modules: [...moduleRows].sort((a, b) => a.sort_order - b.sort_order).map(mapModule),
      practiceTests: practiceTestRows.map(mapPracticeTest),
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
