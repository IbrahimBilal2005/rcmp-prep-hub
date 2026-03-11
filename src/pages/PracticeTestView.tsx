import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Clock3,
  Play,
  RotateCcw,
  Target,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react";
import BrandLockup from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/button";
import { practiceTests } from "@/data/courseData";
import {
  FREE_PREVIEW_TEST_ID,
  canViewDetailedAnswerFeedback,
  canAccessTest,
  isPreviewTestQuestionUnlocked,
} from "@/lib/access";
import {
  getBestPracticeAttempt,
  getPracticeAttempts,
  savePracticeAttempt,
  type PracticeAttemptRecord,
} from "@/lib/practiceTestStorage";

const formatClock = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs === 0 ? `${mins} min` : `${mins}m ${secs}s`;
};

const formatAttemptDate = (isoString: string) =>
  new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoString));

interface ProgressPanelProps {
  answers: Array<number | null>;
  currentQ: number;
  totalQuestions: number;
  timeLeft: number;
  onGoToQuestion: (index: number) => void;
  compact?: boolean;
}

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
        <AlertTriangle className="h-7 w-7 text-accent" />
      </div>
      <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{body}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/signup?step=plan">
          <Button variant="locked">Unlock Full Access</Button>
        </a>
        <Link to={`/test/${FREE_PREVIEW_TEST_ID}`}>
          <Button variant="outline">Open Free Sample</Button>
        </Link>
      </div>
    </div>
  </div>
);

const ProgressPanel = ({
  answers,
  currentQ,
  totalQuestions,
  timeLeft,
  onGoToQuestion,
  compact = false,
}: ProgressPanelProps) => {
  const answered = answers.filter((answer) => answer !== null).length;
  const completion = Math.round((answered / totalQuestions) * 100);

  return (
    <div className={`glass-card rounded-2xl border border-border/60 ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.24em] uppercase text-muted-foreground">Test progress</p>
          <p className="text-lg font-heading font-semibold text-foreground mt-1">{answered} of {totalQuestions} answered</p>
        </div>
        <div className="rounded-xl bg-navy px-3 py-2 text-primary-foreground">
          <p className="text-[10px] uppercase tracking-[0.24em] text-primary-foreground/60">Time left</p>
          <p className={`font-mono text-lg font-bold ${timeLeft < 60 ? "text-red-300" : "text-white"}`}>
            {formatClock(timeLeft)}
          </p>
        </div>
      </div>

      <div className="w-full rounded-full bg-muted h-2 overflow-hidden mb-4">
        <div className="h-full gradient-accent rounded-full transition-all duration-300" style={{ width: `${completion}%` }} />
      </div>

      <div className="grid gap-2 grid-cols-5">
        {answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => onGoToQuestion(index)}
            className={`h-10 rounded-xl text-sm font-semibold transition-all ${
              index === currentQ
                ? "gradient-accent text-accent-foreground shadow-md"
                : answer !== null
                  ? "bg-navy text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted-foreground/15"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {!compact && (
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            Current question
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-navy" />
            Answered
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            Remaining
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gold" />
            Timed attempt
          </div>
        </div>
      )}
    </div>
  );
};

const PracticeTestView = () => {
  const { id } = useParams();
  const test = practiceTests.find((item) => item.id === id);
  const locked = test ? !canAccessTest(test.id) : false;

  const [phase, setPhase] = useState<"intro" | "active" | "review">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);
  const [attemptHistory, setAttemptHistory] = useState<PracticeAttemptRecord[]>([]);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [reviewMeta, setReviewMeta] = useState<{ completedAt: string; timedOut: boolean } | null>(null);

  const persistedAttemptIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!test) {
      return;
    }

    setPhase("intro");
    setCurrentQ(0);
    setAnswers(new Array(test.testQuestions.length).fill(null));
    setTimeLeft(test.time * 60);
    setShowExplanation(null);
    setStartedAt(null);
    setReviewMeta(null);
    persistedAttemptIdRef.current = null;
    setAttemptHistory(getPracticeAttempts(test.id));
  }, [test]);

  useEffect(() => {
    if (phase !== "active") {
      return;
    }

    if (timeLeft <= 0) {
      setReviewMeta({ completedAt: new Date().toISOString(), timedOut: true });
      setPhase("review");
      return;
    }

    const timerId = window.setTimeout(() => setTimeLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timerId);
  }, [phase, timeLeft]);

  const questions = test?.testQuestions ?? [];
  const totalQuestions = questions.length;
  const totalDurationSeconds = test?.time ? test.time * 60 : 0;
  const answered = answers.filter((answer) => answer !== null).length;
  const score = answers.reduce((total, answer, index) => total + (answer === questions[index].correctIndex ? 1 : 0), 0);
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const durationSeconds = Math.min(totalDurationSeconds, Math.max(totalDurationSeconds - timeLeft, 0));
  const currentQuestion = questions[currentQ];
  const timeWarning = timeLeft < 60 && phase === "active";
  const bestAttempt = test ? getBestPracticeAttempt(test.id) : null;
  const questionUnlocked = test ? isPreviewTestQuestionUnlocked(test.id, currentQ) : false;
  const showDetailedFeedback = canViewDetailedAnswerFeedback();

  useEffect(() => {
    if (!test || phase !== "review" || !reviewMeta || !startedAt) {
      return;
    }

    const attemptId = `${test.id}-${reviewMeta.completedAt}`;
    if (persistedAttemptIdRef.current === attemptId) {
      return;
    }

    persistedAttemptIdRef.current = attemptId;
    savePracticeAttempt({
      id: attemptId,
      testId: test.id,
      score,
      totalQuestions,
      percentage,
      startedAt,
      completedAt: reviewMeta.completedAt,
      durationSeconds,
      timedOut: reviewMeta.timedOut,
      answers,
    });
    setAttemptHistory(getPracticeAttempts(test.id));
  }, [answers, durationSeconds, percentage, phase, reviewMeta, score, startedAt, test, totalQuestions]);

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-4">Test not found</h1>
          <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const resetSession = () => {
    setCurrentQ(0);
    setAnswers(new Array(totalQuestions).fill(null));
    setTimeLeft(totalDurationSeconds);
    setShowExplanation(null);
    setStartedAt(null);
    setReviewMeta(null);
    persistedAttemptIdRef.current = null;
  };

  const startTest = () => {
    if (locked) {
      return;
    }

    resetSession();
    setStartedAt(new Date().toISOString());
    setPhase("active");
  };

  const finishTest = (timedOut = false) => {
    if (locked) {
      return;
    }

    setReviewMeta({ completedAt: new Date().toISOString(), timedOut });
    setPhase("review");
  };

  const selectAnswer = (answerIndex: number) => {
    if (!questionUnlocked || locked) {
      return;
    }

    const nextAnswers = [...answers];
    nextAnswers[currentQ] = answerIndex;
    setAnswers(nextAnswers);
  };

  const goToQuestion = (index: number) => {
    setCurrentQ(index);
    setShowExplanation(null);
  };

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
          <div className="container mx-auto px-4 flex items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <BrandLockup
                size="sm"
                subtitle="Practice Tests"
                textClassName="text-foreground"
                subtitleClassName="text-muted-foreground"
              />
            </Link>
          </div>
        </header>

        <div className="container mx-auto max-w-6xl px-4 py-10">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_380px]">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl border border-border/70 p-8 relative overflow-hidden">
              {locked && (
                <LockedMask
                  title="Locked timed test"
                  body="This screen stays identical to the real product, but the test remains blurred and unavailable until full access is unlocked."
                />
              )}

              <div className={locked ? "blur-[4px] select-none" : ""}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center mb-5">
                      <test.icon className="h-8 w-8 text-accent" />
                    </div>
                    <p className="text-sm font-semibold tracking-[0.24em] uppercase text-accent mb-2">{test.category}</p>
                    <h1 className="font-heading font-bold text-3xl text-foreground mb-3">{test.title}</h1>
                    <p className="text-muted-foreground max-w-2xl leading-relaxed">{test.description}</p>
                  </div>

                  <div className="rounded-2xl bg-muted/70 px-4 py-3 min-w-[220px]">
                    <p className="text-xs font-semibold tracking-[0.24em] uppercase text-muted-foreground mb-2">Session format</p>
                    <div className="space-y-2 text-sm text-foreground">
                      <div className="flex items-center gap-2"><Timer className="h-4 w-4 text-accent" /> {test.time} minute time limit</div>
                      <div className="flex items-center gap-2"><Target className="h-4 w-4 text-accent" /> {totalQuestions} scored questions</div>
                      <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-accent" /> Auto-submit when time expires</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 mb-8">
                  <div className="rounded-2xl bg-card border border-border/60 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">Timed format</p>
                    <p className="text-sm text-foreground leading-relaxed">Practice tests now mirror exam pressure. The timer starts only when you launch the attempt.</p>
                  </div>
                  <div className="rounded-2xl bg-card border border-border/60 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">Navigation</p>
                    <p className="text-sm text-foreground leading-relaxed">Move freely between questions using the progress rail while staying centered on the current question.</p>
                  </div>
                  <div className="rounded-2xl bg-card border border-border/60 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">Review</p>
                    <p className="text-sm text-foreground leading-relaxed">Scores, answer explanations, and past attempts are available after every completed run.</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-border/70 bg-card/80 p-5 mb-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent mb-2">What this page includes</p>
                      <p className="font-heading text-xl font-semibold text-foreground">A full test workspace, not just a launch button</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Dashboard resource preview
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-muted/55 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">During the test</p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">Live timer, progress rail, and question-to-question navigation in one view.</p>
                    </div>
                    <div className="rounded-2xl bg-muted/55 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">After submission</p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">Saved attempts, best-score tracking, and a structured review loop.</p>
                    </div>
                    <div className="rounded-2xl bg-muted/55 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Why it matters</p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">Each attempt becomes a reusable study resource instead of a one-time score screen.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="hero" size="xl" className="sm:min-w-[240px]" onClick={startTest} disabled={locked}>
                    <Play className="h-5 w-5 mr-2" />
                    Start Fresh Attempt
                  </Button>
                  <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                    Use this screen to review previous scores before launching a new timed attempt.
                    {!showDetailedFeedback && " Free preview attempts hide correct answers and full answer review."}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-4">
              <div className="glass-card rounded-3xl border border-border/70 p-6">
                <p className="text-xs font-semibold tracking-[0.24em] uppercase text-muted-foreground mb-3">Past attempts</p>
                {attemptHistory.length === 0 ? (
                  <div className="rounded-2xl bg-muted/70 p-5 text-sm text-muted-foreground leading-relaxed">
                    No completed attempts yet. Your first result will appear here after you finish the test.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attemptHistory.slice(0, 4).map((attempt, index) => (
                      <div key={attempt.id} className="rounded-2xl bg-card border border-border/60 p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">Attempt {attemptHistory.length - index}</p>
                            <p className="text-xs text-muted-foreground">{formatAttemptDate(attempt.completedAt)}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${attempt.percentage >= 70 ? "bg-green-500/10 text-green-600" : "bg-accent/10 text-accent"}`}>
                            {attempt.percentage}%
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{attempt.score}/{attempt.totalQuestions} correct</span>
                          <span>{formatDuration(attempt.durationSeconds)}</span>
                          <span>{attempt.timedOut ? "Timed out" : "Submitted"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card rounded-3xl border border-border/70 p-6">
                <p className="text-xs font-semibold tracking-[0.24em] uppercase text-muted-foreground mb-3">Best result</p>
                {bestAttempt ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
                    <p className="text-sm text-emerald-700 mb-1">Best completed score</p>
                    <p className="text-3xl font-heading font-bold mb-2">{bestAttempt.percentage}%</p>
                    <p className="text-sm text-emerald-800/80">
                      {bestAttempt.score}/{bestAttempt.totalQuestions} correct in {formatDuration(bestAttempt.durationSeconds)}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800/80">
                    Best-score tracking will appear after your first completed attempt.
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "review") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
          <div className="container mx-auto px-4 flex items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <BrandLockup
                size="sm"
                subtitle="Practice Tests"
                textClassName="text-foreground"
                subtitleClassName="text-muted-foreground"
              />
            </Link>
          </div>
        </header>

        <div className="container mx-auto max-w-5xl px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl border border-border/70 p-8 text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${percentage >= 70 ? "gradient-gold" : "gradient-accent"}`}>
              {percentage >= 70 ? (
                <Trophy className="h-8 w-8 text-gold-foreground" />
              ) : (
                <CheckCircle className="h-8 w-8 text-accent-foreground" />
              )}
            </div>
            <h2 className="font-heading font-bold text-3xl text-foreground mb-2">
              {reviewMeta?.timedOut ? "Time expired" : "Attempt complete"}
            </h2>
            <p className="text-muted-foreground mb-5">
              {reviewMeta?.timedOut
                ? "The test auto-submitted when the timer reached zero. Your recorded answers are saved below."
                : "Review your score, inspect each answer, and decide where to focus before the next attempt."}
            </p>

            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="rounded-2xl bg-card border border-border/60 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">Score</p>
                <p className="text-3xl font-heading font-bold text-foreground">{score}/{totalQuestions}</p>
              </div>
              <div className="rounded-2xl bg-card border border-border/60 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">Accuracy</p>
                <p className="text-3xl font-heading font-bold text-foreground">{percentage}%</p>
              </div>
              <div className="rounded-2xl bg-card border border-border/60 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">Time used</p>
                <p className="text-3xl font-heading font-bold text-foreground">{formatDuration(durationSeconds)}</p>
              </div>
            </div>

            <div className="w-full max-w-sm mx-auto rounded-full bg-muted h-4 overflow-hidden mb-6">
              <div
                className={`h-full rounded-full transition-all duration-700 ${percentage >= 70 ? "gradient-gold" : "gradient-accent"}`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={startTest}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Attempt Again
              </Button>
              <Button variant="hero" onClick={() => { resetSession(); setPhase("intro"); }}>
                Review Past Attempts
              </Button>
              <Link to="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          </motion.div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="font-heading font-semibold text-lg text-foreground">Answer review</h3>
            <p className="text-sm text-muted-foreground">{attemptHistory.length} saved attempt{attemptHistory.length === 1 ? "" : "s"} for this test</p>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctIndex;
              const reviewQuestionUnlocked = isPreviewTestQuestionUnlocked(test.id, index);

              return (
                <div key={index} className="glass-card rounded-2xl border border-border/60 p-5 relative overflow-hidden">
                  {!reviewQuestionUnlocked && (
                    <LockedMask
                      title="Preview limit"
                      body="Only the first available free-plan questions are open. The rest of the answer review stays masked until full access is unlocked."
                    />
                  )}
                  <div className={!reviewQuestionUnlocked ? "blur-[4px] select-none" : ""}>
                    <div className="flex items-start gap-3 mb-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm mb-1">{index + 1}. {question.question}</p>
                        {userAnswer !== null ? (
                          <p className="text-sm text-muted-foreground">Your answer: {question.options[userAnswer]}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">No answer submitted.</p>
                        )}
                        {showDetailedFeedback ? (
                          <p className="text-sm text-green-600 mt-1">Correct answer: {question.options[question.correctIndex]}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">Correct answer available with premium access.</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowExplanation(showExplanation === index ? null : index)}
                      className="text-xs font-medium text-accent hover:underline"
                      disabled={!reviewQuestionUnlocked || !showDetailedFeedback}
                    >
                      {showDetailedFeedback ? (showExplanation === index ? "Hide explanation" : "Show explanation") : "Premium explanation"}
                    </button>
                    {showExplanation === index && showDetailedFeedback && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground mt-3 bg-muted rounded-xl p-4">
                        {question.explanation}
                      </motion.p>
                    )}
                    {!showDetailedFeedback && reviewQuestionUnlocked && (
                      <div className="text-sm text-muted-foreground mt-3 bg-muted rounded-xl p-4">
                        Detailed explanations and the full answer breakdown unlock with premium access.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="container mx-auto px-4 flex items-center justify-between h-16 gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-1">Timed practice test</p>
            <p className="font-heading text-sm sm:text-base font-semibold text-foreground truncate">{test.title}</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className={`hidden sm:flex items-center gap-1.5 font-mono text-sm font-bold ${timeWarning ? "text-red-500 animate-pulse" : "text-foreground"}`}>
              {timeWarning && <AlertTriangle className="h-4 w-4" />}
              <Timer className="h-4 w-4" />
              {formatClock(timeLeft)}
            </span>
            <Button variant="hero" size="sm" onClick={() => finishTest(false)}>
              Submit ({answered}/{totalQuestions})
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-6 lg:py-8">
        <div className="xl:hidden mb-5">
          <ProgressPanel
            answers={answers}
            currentQ={currentQ}
            totalQuestions={totalQuestions}
            timeLeft={timeLeft}
            onGoToQuestion={goToQuestion}
            compact
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
          <div className="min-w-0">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              className="mx-auto w-full max-w-3xl glass-card rounded-3xl border border-border/70 p-6 sm:p-8 shadow-xl relative overflow-hidden"
            >
              {(!questionUnlocked || locked) && (
                <LockedMask
                  title={locked ? "Locked timed test" : "Preview question limit reached"}
                  body={locked
                    ? "This timed test remains visible in the real layout, but its questions stay locked until full access is unlocked."
                    : "The free plan only unlocks the first few questions. The remaining questions stay visible in the real test layout but require full access."}
                />
              )}

              <div className={!questionUnlocked || locked ? "blur-[4px] select-none" : ""}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.24em] uppercase text-muted-foreground mb-2">Question {currentQ + 1} of {totalQuestions}</p>
                    <h2 className="font-heading text-2xl font-semibold text-foreground leading-tight">{currentQuestion.question}</h2>
                  </div>
                  <div className="rounded-xl bg-muted/80 px-3 py-2 text-sm text-muted-foreground">
                    {answered} answered
                  </div>
                </div>

                <div className="w-full rounded-full bg-muted h-2 overflow-hidden mb-8">
                  <div
                    className="h-full gradient-accent rounded-full transition-all duration-300"
                    style={{ width: `${((currentQ + 1) / totalQuestions) * 100}%` }}
                  />
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      disabled={!questionUnlocked || locked}
                      className={`w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 ${
                        answers[currentQ] === index
                          ? "border-2 border-accent bg-accent/5 shadow-sm"
                          : "border border-border/60 bg-card hover:border-accent/40 hover:bg-card/95"
                      }`}
                    >
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                        answers[currentQ] === index ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-foreground font-medium">{option}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3 mt-8">
                  <Button variant="outline" disabled={currentQ === 0} onClick={() => goToQuestion(currentQ - 1)}>
                    Previous
                  </Button>
                  <Button
                    variant="default"
                    disabled={locked}
                    onClick={() => {
                      if (currentQ < totalQuestions - 1) {
                        goToQuestion(currentQ + 1);
                        return;
                      }

                      finishTest(false);
                    }}
                  >
                    {currentQ < totalQuestions - 1 ? "Next Question" : "Review and Submit"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          <aside className="hidden xl:block xl:sticky xl:top-24">
            <ProgressPanel
              answers={answers}
              currentQ={currentQ}
              totalQuestions={totalQuestions}
              timeLeft={timeLeft}
              onGoToQuestion={goToQuestion}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PracticeTestView;
