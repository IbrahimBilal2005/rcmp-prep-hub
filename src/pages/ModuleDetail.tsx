import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Circle,
  Clock,
  HelpCircle,
  LockKeyhole,
  Play,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { modules } from "@/data/courseData";
import {
  FREE_PREVIEW_MODULE_ID,
  canAccessModule,
  canViewDetailedAnswerFeedback,
  hasFullAccess,
  isPreviewLessonUnlocked,
  isPreviewModuleQuizQuestionUnlocked,
} from "@/lib/access";
import { getModuleProgress, isModuleFullyCompleted, upsertModuleProgress } from "@/lib/moduleProgressStorage";

const LockedMask = ({
  title,
  body,
}: {
  title: string;
  body: string;
}) => (
  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/45 backdrop-blur-[6px]">
    <div className="mx-4 max-w-md rounded-3xl border border-border/70 bg-background/92 p-6 text-center shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
        <LockKeyhole className="h-7 w-7 text-accent" />
      </div>
      <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{body}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/signup?step=plan">
          <Button variant="locked">Unlock Full Access</Button>
        </a>
        <Link to={`/module/${FREE_PREVIEW_MODULE_ID}`}>
          <Button variant="outline">Open Available Module</Button>
        </Link>
      </div>
    </div>
  </div>
);

const ModuleDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const moduleId = Number(id);
  const mod = modules.find((m) => m.id === moduleId);

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lockedModule = mod ? !canAccessModule(moduleId) : false;
  const isPremium = hasFullAccess();
  const quiz = mod?.quiz ?? [];
  const currentQuestion = quiz[currentQ];
  const showDetailedFeedback = canViewDetailedAnswerFeedback();

  const syncProgress = (updater: Parameters<typeof upsertModuleProgress>[1]) => {
    const next = upsertModuleProgress(moduleId, updater);
    setCompletedLessons(next.completedLessons);
    return next;
  };

  useEffect(() => {
    const progress = getModuleProgress(moduleId);
    const lessonParam = searchParams.get("lesson");
    const lessonIndex = lessonParam === null ? null : Number(lessonParam);

    setCompletedLessons(progress?.completedLessons ?? []);
    setSelectedLessonIndex(
      lessonIndex !== null && Number.isInteger(lessonIndex)
        ? Math.min(Math.max(lessonIndex, 0), (mod?.lessons.length ?? 1) - 1)
        : progress?.lastLessonIndex ?? 0,
    );
    setQuizStarted(Boolean(progress?.quizStarted && !progress.quizCompleted));
  }, [moduleId, mod?.lessons.length, searchParams]);

  if (!mod) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-4">Module not found</h1>
          <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const Icon = mod.icon;
  const totalLessonMinutes = mod.lessons.reduce((a, l) => a + parseInt(l.duration, 10), 0);
  const allLessonsCompleted = completedLessons.length === mod.lessons.length;
  const lessonUnlocked = isPreviewLessonUnlocked(moduleId, selectedLessonIndex);
  const questionUnlocked = isPreviewModuleQuizQuestionUnlocked(moduleId, currentQ);
  const totalProgressSteps = mod.lessons.length + 1;
  const storedProgress = getModuleProgress(moduleId);
  const fullyCompleted = isModuleFullyCompleted(storedProgress, mod.lessons.length);
  const progressValue = Math.round(
    ((completedLessons.length + ((storedProgress?.quizCompleted || quizFinished) ? 1 : 0)) / totalProgressSteps) * 100,
  );

  const selectLesson = (index: number) => {
    if (!isPreviewLessonUnlocked(moduleId, index)) {
      return;
    }

    syncProgress((current) => ({
      ...current,
      started: true,
      lastLessonIndex: index,
      updatedAt: new Date().toISOString(),
    }));

    navigate(`/module/${moduleId}/lesson/${index}`);
  };

  const toggleLessonComplete = (index: number) => {
    if (!isPreviewLessonUnlocked(moduleId, index) || lockedModule) {
      return;
    }

    syncProgress((current) => {
      const completed = current.completedLessons.includes(index)
        ? current.completedLessons.filter((item) => item !== index)
        : [...current.completedLessons, index].sort((a, b) => a - b);

      return {
        ...current,
        started: true,
        lastLessonIndex: index,
        completedLessons: completed,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleAnswer = (idx: number) => {
    if (showExplanation || !questionUnlocked || lockedModule) {
      return;
    }

    setSelectedAnswer(idx);
    setShowExplanation(true);
    setAnsweredCount((prev) => prev + 1);

    if (idx === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (lockedModule) {
      return;
    }

    if (currentQ < quiz.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      return;
    }

    syncProgress((current) => ({
      ...current,
      started: true,
      quizStarted: false,
      quizCompleted: true,
      quizScore: score,
      quizTotal: quiz.length,
      updatedAt: new Date().toISOString(),
    }));
    setQuizFinished(true);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
    setAnsweredCount(0);

    if (!lockedModule) {
      syncProgress((current) => ({
        ...current,
        started: true,
        quizStarted: false,
        quizCompleted: false,
        quizScore: null,
        quizTotal: null,
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  const startQuiz = () => {
    if (lockedModule) {
      return;
    }

    setQuizStarted(true);
    setQuizFinished(false);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredCount(0);
    syncProgress((current) => ({
      ...current,
      started: true,
      quizStarted: true,
      updatedAt: new Date().toISOString(),
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
              <Icon className="h-7 w-7 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-accent font-semibold">Module {moduleId}</p>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">{mod.title}</h1>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">{mod.description}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground mb-5">
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {mod.lessons.length} lessons</span>
            <span className="flex items-center gap-1"><HelpCircle className="h-4 w-4" /> {quiz.length} quiz questions</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {totalLessonMinutes} min</span>
          </div>

          <div className="rounded-2xl bg-muted/70 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-sm font-medium text-foreground">Module progress</p>
              <p className="text-sm text-muted-foreground">{completedLessons.length}/{mod.lessons.length} lessons completed</p>
            </div>
            <div className="w-full bg-background rounded-full h-2.5 overflow-hidden">
              <div className="h-full gradient-accent rounded-full transition-all duration-300" style={{ width: `${progressValue}%` }} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-8">
          {mod.lessons.map((lesson, i) => {
            const isSelected = selectedLessonIndex === i;
            const isCompleted = completedLessons.includes(i);
            const isUnlocked = isPreviewLessonUnlocked(moduleId, i) && !lockedModule;

            return (
              <div
                key={lesson.title}
                className={`glass-card rounded-xl p-4 flex items-center gap-4 transition-all duration-200 ${
                  isSelected ? "border-accent/40 shadow-md" : ""
                } ${isUnlocked ? "hover:border-accent/30 hover:shadow-md" : ""}`}
              >
                <button
                  onClick={() => selectLesson(i)}
                  className="flex items-center gap-4 text-left flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Play className="h-4 w-4 text-accent" />
                  </div>
                  <div className={`flex-1 min-w-0 ${isUnlocked ? "" : "blur-[3px] select-none"}`}>
                    <p className="font-medium text-foreground">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {lesson.duration}
                    </p>
                  </div>
                </button>

                {isUnlocked ? (
                  <button
                    onClick={() => toggleLessonComplete(i)}
                    className="flex-shrink-0 text-muted-foreground hover:text-accent transition-colors"
                    aria-label={isCompleted ? "Mark lesson incomplete" : "Mark lesson complete"}
                  >
                    {isCompleted ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6" />}
                  </button>
                ) : (
                  <LockKeyhole className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative glass-card rounded-3xl p-6 sm:p-8 overflow-hidden">
          {lockedModule && (
            <LockedMask
              title="Locked module"
              body="This module is visible so users can inspect the real layout, but the content stays locked until full access is unlocked."
            />
          )}

          <div className={lockedModule ? "blur-[4px] select-none" : ""}>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] uppercase text-accent mb-2">Module Quiz</p>
                <h2 className="font-heading text-2xl font-semibold text-foreground">Knowledge Check</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                  Test your understanding of the material covered in this module.
                  {!isPremium && !showDetailedFeedback && " Detailed explanations and correct answers unlock with premium access."}
                </p>
              </div>
              <div className="rounded-2xl bg-muted/70 px-4 py-3 text-sm">
                <p className="text-muted-foreground mb-1">Status</p>
                <p className="font-semibold text-foreground">
                  {fullyCompleted
                    ? "Completed"
                    : quizFinished || storedProgress?.quizCompleted
                      ? "Quiz finished"
                      : quizStarted
                        ? "In progress"
                        : allLessonsCompleted
                          ? "Ready"
                          : "Available"}
                </p>
              </div>
            </div>

            {!quizStarted && !quizFinished ? (
              <div className="rounded-2xl bg-muted/50 border border-border/60 p-6">
                <p className="text-muted-foreground mb-1">{quiz.length} questions | Untimed</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Move into the quiz whenever you are ready. You do not need a separate tab to start it.
                </p>
                <Button variant="hero" size="lg" onClick={startQuiz}>
                  Start Quiz <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            ) : quizFinished ? (
              <div className="rounded-2xl bg-muted/50 border border-border/60 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-gold-foreground" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-foreground mb-2">
                  {score === quiz.length ? "Module Complete!" : "Quiz Complete"}
                </h3>
                <p className="text-4xl font-heading font-bold text-foreground mb-1">{score}/{quiz.length}</p>
                <p className="text-muted-foreground mb-6">{Math.round((score / quiz.length) * 100)}% correct</p>
                <div className="w-full max-w-xl mx-auto bg-background rounded-full h-3 mb-6 overflow-hidden">
                  <div className="h-full gradient-accent rounded-full transition-all duration-500" style={{ width: `${(score / quiz.length) * 100}%` }} />
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={resetQuiz}>
                    <RotateCcw className="h-4 w-4 mr-1" /> Retry
                  </Button>
                  <Link to="/dashboard">
                    <Button variant="default">Back to Dashboard</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl bg-muted/50 border border-border/60 p-6 overflow-hidden">
                {(!questionUnlocked || lockedModule) && (
                  <LockedMask
                    title={lockedModule ? "Locked module quiz" : "Question locked"}
                    body={lockedModule
                      ? "This module quiz stays locked until full access is unlocked."
                      : "Only part of this quiz is available on the free plan. Unlock premium to access the remaining questions and detailed answer review."}
                  />
                )}

                <div className={!questionUnlocked || lockedModule ? "blur-[4px] select-none" : ""}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Question {currentQ + 1} of {quiz.length}</span>
                    <span className="text-sm text-muted-foreground">Score: {score}/{answeredCount}</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 mb-6 overflow-hidden">
                    <div className="h-full gradient-accent rounded-full transition-all duration-300" style={{ width: `${((currentQ + 1) / quiz.length) * 100}%` }} />
                  </div>

                  <h3 className="font-semibold text-lg text-foreground mb-5">{currentQuestion.question}</h3>

                  <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((opt, idx) => {
                      let optionStyle = "glass-card hover:border-accent/30";
                      if (showExplanation && showDetailedFeedback) {
                        if (idx === currentQuestion.correctIndex) {
                          optionStyle = "border-2 border-green-500 bg-green-500/10";
                        } else if (idx === selectedAnswer && idx !== currentQuestion.correctIndex) {
                          optionStyle = "border-2 border-destructive bg-destructive/10";
                        } else {
                          optionStyle = "border border-border opacity-50";
                        }
                      } else if (selectedAnswer === idx) {
                        optionStyle = "border-2 border-accent bg-accent/5";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          disabled={showExplanation || !questionUnlocked || lockedModule}
                          className={`w-full text-left rounded-xl p-4 flex items-center gap-3 transition-all duration-200 ${optionStyle}`}
                        >
                          <span className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-sm font-semibold text-muted-foreground flex-shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-foreground font-medium">{opt}</span>
                          {showExplanation && showDetailedFeedback && idx === currentQuestion.correctIndex && (
                            <CheckCircle className="h-5 w-5 text-green-500 ml-auto flex-shrink-0" />
                          )}
                          {showExplanation && showDetailedFeedback && idx === selectedAnswer && idx !== currentQuestion.correctIndex && (
                            <XCircle className="h-5 w-5 text-destructive ml-auto flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation && showDetailedFeedback && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-background rounded-xl p-4 mb-6">
                      <p className="text-sm font-semibold text-foreground mb-1">Explanation</p>
                      <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                    </motion.div>
                  )}

                  {showExplanation && !showDetailedFeedback && !isPremium && (
                    <div className="rounded-xl border border-dashed border-border px-4 py-4 mb-6 bg-background/60">
                      <p className="text-sm font-semibold text-foreground mb-1">Detailed feedback is premium</p>
                      <p className="text-sm text-muted-foreground">
                        Free-plan users can answer available questions, but explanations and correct answers unlock with premium access.
                      </p>
                    </div>
                  )}

                  {showExplanation && (
                    <Button variant="hero" onClick={handleNext} className="w-full">
                      {currentQ < quiz.length - 1 ? "Next Question" : "See Results"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModuleDetail;
