import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Timer, CheckCircle, XCircle, ChevronRight,
  RotateCcw, AlertTriangle, Shield
} from "lucide-react";
import { practiceTests } from "@/data/courseData";

const PracticeTestView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const test = practiceTests.find(t => t.id === id);

  const [phase, setPhase] = useState<"intro" | "active" | "review">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  useEffect(() => {
    if (test) {
      setAnswers(new Array(test.testQuestions.length).fill(null));
      setTimeLeft(test.time * 60);
    }
  }, [test]);

  // Timer
  useEffect(() => {
    if (phase !== "active") return;
    if (timeLeft <= 0) { setPhase("review"); return; }
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [phase, timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

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

  const questions = test.testQuestions;
  const totalQuestions = questions.length;
  const score = answers.reduce((acc, a, i) => acc + (a === questions[i].correctIndex ? 1 : 0), 0);
  const answered = answers.filter(a => a !== null).length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const timeWarning = timeLeft < 60 && timeLeft > 0;

  const selectAnswer = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const goToQuestion = (i: number) => {
    setCurrentQ(i);
    setShowExplanation(null);
  };

  // INTRO
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-navy border-b border-navy-light/30 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Shield className="h-7 w-7 text-accent" />
              <span className="font-heading text-lg font-bold text-primary-foreground">AptitudeForge</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center mx-auto mb-5">
              <test.icon className="h-8 w-8 text-accent" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-2">{test.title}</h1>
            <p className="text-muted-foreground mb-6">{test.description}</p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1"><Timer className="h-4 w-4" />{test.time} minutes</span>
              <span>{totalQuestions} questions</span>
            </div>
            <div className="bg-muted rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-foreground mb-2">Instructions</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• This test is timed — the clock starts when you click "Begin"</li>
                <li>• You can navigate between questions freely</li>
                <li>• Submit when you're ready or when time runs out</li>
                <li>• Scores and explanations are shown after submission</li>
              </ul>
            </div>
            <Button variant="hero" size="xl" className="w-full" onClick={() => setPhase("active")}>
              Begin Test <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // REVIEW
  if (phase === "review") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-navy border-b border-navy-light/30 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Shield className="h-7 w-7 text-accent" />
              <span className="font-heading text-lg font-bold text-primary-foreground">AptitudeForge</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Score summary */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-gold-foreground" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-1">Test Complete!</h2>
            <p className="text-5xl font-heading font-bold text-foreground my-4">{score}/{totalQuestions}</p>
            <p className="text-lg text-muted-foreground mb-4">{percentage}% correct</p>
            <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-4 mb-6 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${percentage >= 70 ? "gradient-gold" : "gradient-accent"}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setPhase("intro"); setCurrentQ(0); setAnswers(new Array(totalQuestions).fill(null)); setTimeLeft(test.time * 60); setShowExplanation(null); }}>
                <RotateCcw className="h-4 w-4 mr-1" /> Retake
              </Button>
              <Link to="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          </motion.div>

          {/* Question review */}
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Review Answers</h3>
          <div className="space-y-4">
            {questions.map((q, i) => {
              const userAnswer = answers[i];
              const isCorrect = userAnswer === q.correctIndex;
              return (
                <div key={i} className="glass-card rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-foreground text-sm">{i + 1}. {q.question}</p>
                      {userAnswer !== null && userAnswer !== q.correctIndex && (
                        <p className="text-sm text-destructive mt-1">Your answer: {q.options[userAnswer]}</p>
                      )}
                      <p className="text-sm text-green-600 mt-0.5">Correct: {q.options[q.correctIndex]}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExplanation(showExplanation === i ? null : i)}
                    className="text-xs text-accent font-medium hover:underline"
                  >
                    {showExplanation === i ? "Hide" : "Show"} explanation
                  </button>
                  {showExplanation === i && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground mt-2 bg-muted rounded-lg p-3">
                      {q.explanation}
                    </motion.p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE TEST
  const currentQuestion = questions[currentQ];

  return (
    <div className="min-h-screen bg-background">
      {/* Test header with timer */}
      <header className="bg-navy border-b border-navy-light/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <span className="font-heading text-sm font-semibold text-primary-foreground">{test.title}</span>
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1.5 font-mono text-sm font-bold ${timeWarning ? "text-destructive animate-pulse" : "text-primary-foreground"}`}>
              {timeWarning && <AlertTriangle className="h-4 w-4" />}
              <Timer className="h-4 w-4" />
              {formatTime(timeLeft)}
            </span>
            <Button
              variant="hero"
              size="sm"
              onClick={() => setPhase("review")}
            >
              Submit ({answered}/{totalQuestions})
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex gap-6">
          {/* Question nav - desktop */}
          <div className="hidden lg:block w-48 flex-shrink-0">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Questions</p>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToQuestion(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    i === currentQ
                      ? "gradient-accent text-accent-foreground"
                      : answers[i] !== null
                      ? "bg-navy text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Main question area */}
          <div className="flex-1 min-w-0">
            {/* Mobile question nav */}
            <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToQuestion(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold flex-shrink-0 transition-all ${
                    i === currentQ
                      ? "gradient-accent text-accent-foreground"
                      : answers[i] !== null
                      ? "bg-navy text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <motion.div key={currentQ} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
              <p className="text-sm text-muted-foreground mb-2">Question {currentQ + 1} of {totalQuestions}</p>
              <h2 className="font-semibold text-lg text-foreground mb-6">{currentQuestion.question}</h2>

              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(idx)}
                    className={`w-full text-left rounded-xl p-4 flex items-center gap-3 transition-all duration-200 ${
                      answers[currentQ] === idx
                        ? "border-2 border-accent bg-accent/5 shadow-sm"
                        : "glass-card hover:border-accent/30"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                      answers[currentQ] === idx ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-foreground font-medium">{opt}</span>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  disabled={currentQ === 0}
                  onClick={() => goToQuestion(currentQ - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    if (currentQ < totalQuestions - 1) goToQuestion(currentQ + 1);
                    else setPhase("review");
                  }}
                >
                  {currentQ < totalQuestions - 1 ? "Next" : "Review & Submit"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeTestView;
