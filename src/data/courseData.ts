import type { LucideIcon } from "lucide-react";

export interface QuizOption {
  text: string;
  imagePath: string | null;
  imageUrl?: string | null;
}

export interface QuizQuestion {
  id?: number;
  question: string;
  questionImagePath: string | null;
  questionImageUrl?: string | null;
  options: QuizOption[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleLesson {
  id?: number;
  title: string;
  duration: string;
  summary: string;
  chapterLabel: string;
  videoUrl: string | null;
  posterUrl: string | null;
}

export interface ModuleInfo {
  id: number;
  slug?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  lessons: ModuleLesson[];
  quiz: QuizQuestion[];
}

export interface PracticeTest {
  id: string;
  dbId?: number;
  slug?: string;
  title: string;
  description: string;
  questions: number;
  time: number;
  category: string;
  icon: LucideIcon;
  testQuestions: QuizQuestion[];
}
