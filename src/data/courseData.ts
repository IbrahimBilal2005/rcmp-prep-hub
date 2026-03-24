import type { LucideIcon } from "lucide-react";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleLesson {
  title: string;
  duration: string;
  summary: string;
  chapterLabel: string;
  videoUrl: string | null;
  posterUrl: string | null;
}

export interface ModuleInfo {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  lessons: ModuleLesson[];
  quiz: QuizQuestion[];
}

export interface PracticeTest {
  id: string;
  title: string;
  description: string;
  questions: number;
  time: number;
  category: string;
  icon: LucideIcon;
  testQuestions: QuizQuestion[];
}
