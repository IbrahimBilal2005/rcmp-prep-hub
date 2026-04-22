import type { QuizQuestion } from "@/data/courseData";

const normalizeIndexes = (indexes: number[], optionCount: number) =>
  [...new Set(indexes)]
    .filter((index) => Number.isInteger(index) && index >= 0 && index < optionCount)
    .sort((a, b) => a - b);

export const getCorrectIndexes = (question: Pick<QuizQuestion, "correctIndex" | "correctIndexes" | "options">) => {
  const optionCount = question.options.length;
  const explicitIndexes = Array.isArray(question.correctIndexes)
    ? normalizeIndexes(question.correctIndexes, optionCount)
    : [];

  if (explicitIndexes.length > 0) {
    return explicitIndexes;
  }

  if (typeof question.correctIndex === "number" && question.correctIndex >= 0 && question.correctIndex < optionCount) {
    return [question.correctIndex];
  }

  return optionCount > 0 ? [0] : [];
};

export const getPrimaryCorrectIndex = (question: Pick<QuizQuestion, "correctIndex" | "correctIndexes" | "options">) => {
  const [first] = getCorrectIndexes(question);
  return typeof first === "number" ? first : null;
};

export const isCorrectAnswer = (question: Pick<QuizQuestion, "correctIndex" | "correctIndexes" | "options">, answer: number | null) =>
  answer !== null && getCorrectIndexes(question).includes(answer);

export const formatCorrectAnswerText = (question: Pick<QuizQuestion, "correctIndex" | "correctIndexes" | "options">) =>
  getCorrectIndexes(question)
    .map((index) => question.options[index]?.text)
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(", ");
