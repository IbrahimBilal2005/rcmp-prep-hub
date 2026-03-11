import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Play, Clock, CheckCircle, BookOpen, HelpCircle,
  ChevronRight, XCircle, RotateCcw
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { modules } from "@/data/courseData";

const ModuleDetail = () => {
  const { id } = useParams();
  const moduleId = Number(id);
  const mod = modules.find(m => m.id === moduleId);

  const [activeSection, setActiveSection] = useState<"lessons" | "quiz">("lessons");
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

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
  const quiz = mod.quiz;
  const currentQuestion = quiz[currentQ];

  const handleAnswer = (idx: number) => {
    if (showExplanation) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    setAnsweredCount(prev => prev + 1);
    if (idx === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < quiz.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
    setAnsweredCount(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Module header */}
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
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {mod.lessons.length} lessons</span>
            <span className="flex items-center gap-1"><HelpCircle className="h-4 w-4" /> {quiz.length} quiz questions</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {mod.lessons.reduce((a, l) => a + parseInt(l.duration), 0)} min
            </span>
          </div>
        </motion.div>

        {/* Section tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
          {[
            { key: "lessons" as const, label: "Lessons", icon: BookOpen, count: mod.lessons.length },
            { key: "quiz" as const, label: "Module Quiz", icon: HelpCircle, count: quiz.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveSection(tab.key); if (tab.key === "lessons") resetQuiz(); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeSection === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className="text-xs bg-muted-foreground/10 px-1.5 py-0.5 rounded-md">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeSection === "lessons" ? (
            <motion.div key="lessons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="space-y-3">
                {mod.lessons.map((lesson, i) => (
                  <motion.div
                    key={lesson.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-accent/30 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Play className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> {lesson.duration}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-muted-foreground/20 flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {!quizStarted && !quizFinished ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-foreground mb-2">Module Quiz</h3>
                  <p className="text-muted-foreground mb-1">{quiz.length} questions · Untimed · Instant feedback</p>
                  <p className="text-sm text-muted-foreground mb-6">Test your understanding of the material covered in this module.</p>
                  <Button variant="hero" size="lg" onClick={() => setQuizStarted(true)}>
                    Start Quiz <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ) : quizFinished ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-gold-foreground" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-foreground mb-2">Quiz Complete!</h3>
                  <p className="text-4xl font-heading font-bold text-foreground mb-1">{score}/{quiz.length}</p>
                  <p className="text-muted-foreground mb-6">{Math.round((score / quiz.length) * 100)}% correct</p>
                  <div className="w-full bg-muted rounded-full h-3 mb-6 overflow-hidden">
                    <div
                      className="h-full gradient-accent rounded-full transition-all duration-500"
                      style={{ width: `${(score / quiz.length) * 100}%` }}
                    />
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
                <div className="glass-card rounded-xl p-6">
                  {/* Progress */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Question {currentQ + 1} of {quiz.length}</span>
                    <span className="text-sm text-muted-foreground">Score: {score}/{answeredCount}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden">
                    <div
                      className="h-full gradient-accent rounded-full transition-all duration-300"
                      style={{ width: `${((currentQ + 1) / quiz.length) * 100}%` }}
                    />
                  </div>

                  {/* Question */}
                  <h3 className="font-semibold text-lg text-foreground mb-5">{currentQuestion.question}</h3>

                  {/* Options */}
                  <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((opt, idx) => {
                      let optionStyle = "glass-card hover:border-accent/30 cursor-pointer";
                      if (showExplanation) {
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
                          disabled={showExplanation}
                          className={`w-full text-left rounded-xl p-4 flex items-center gap-3 transition-all duration-200 ${optionStyle}`}
                        >
                          <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground flex-shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-foreground font-medium">{opt}</span>
                          {showExplanation && idx === currentQuestion.correctIndex && (
                            <CheckCircle className="h-5 w-5 text-green-500 ml-auto flex-shrink-0" />
                          )}
                          {showExplanation && idx === selectedAnswer && idx !== currentQuestion.correctIndex && (
                            <XCircle className="h-5 w-5 text-destructive ml-auto flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-muted rounded-xl p-4 mb-6"
                    >
                      <p className="text-sm font-semibold text-foreground mb-1">Explanation</p>
                      <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                    </motion.div>
                  )}

                  {showExplanation && (
                    <Button variant="hero" onClick={handleNext} className="w-full">
                      {currentQ < quiz.length - 1 ? "Next Question" : "See Results"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModuleDetail;
