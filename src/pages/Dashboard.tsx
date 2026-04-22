import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  LockKeyhole,
  Play,
  Shield,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { initializeAuthSession } from "@/lib/auth";
import { FREE_PREVIEW_MODULE_ID, FREE_PREVIEW_TEST_ID, canAccessModule, canAccessTest, isFreePreviewMode } from "@/lib/access";
import { getAllModuleProgress, isModuleFullyCompleted } from "@/lib/moduleProgressStorage";
import {
  getBestPracticeAttempt,
  getPracticeAttempts,
  getTotalPracticeAttempts,
} from "@/lib/practiceTestStorage";
import { getEmptyCourseContent } from "@/services/content/service";
import { useCourseContent } from "@/services/content/useCourseContent";

type Tab = "modules" | "tests";

interface TestCardMeta {
  attempts: number;
  bestPercentage: number | null;
}

const getModuleCompletion = (
  lessonCount: number,
  completedLessons: number,
  quizCompleted: boolean,
  quizScore: number | null,
  quizTotal: number | null,
  fullyCompleted: boolean,
) => {
  if (fullyCompleted) {
    return 100;
  }

  const lessonCompletion = lessonCount > 0 ? (completedLessons / lessonCount) * 85 : 0;
  const quizCompletion =
    quizCompleted && quizScore !== null && quizTotal !== null && quizTotal > 0
      ? (quizScore / quizTotal) * 14
      : 0;

  return Math.max(0, Math.min(99, Math.round(lessonCompletion + quizCompletion)));
};

const getResumeLessonIndex = (lessonCount: number, completedLessons: number, lastLessonIndex: number | null) => {
  if (completedLessons < lessonCount) {
    return Math.min(lastLessonIndex ?? completedLessons, lessonCount - 1);
  }

  return Math.max(lessonCount - 1, 0);
};

const Dashboard = () => {
  const { data: courseContent, isLoading } = useCourseContent();
  const resolvedCourseContent = courseContent ?? getEmptyCourseContent();
  const modules = resolvedCourseContent.modules;
  const practiceTests = resolvedCourseContent.practiceTests;
  const contentError = resolvedCourseContent.error;
  const [activeTab, setActiveTab] = useState<Tab>("modules");
  const [checkoutNotice, setCheckoutNotice] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");

    if (checkoutStatus !== "success") {
      return;
    }

    void (async () => {
      await initializeAuthSession();
      setCheckoutNotice("Premium access is now active on your account.");
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("checkout");
      setSearchParams(nextParams, { replace: true });
    })();
  }, [searchParams, setSearchParams]);

  const testMeta = useMemo<Record<string, TestCardMeta>>(
    () =>
      Object.fromEntries(
      practiceTests.map((test) => {
        const attempts = getPracticeAttempts(test.id);
        const bestAttempt = getBestPracticeAttempt(test.id);

        return [
          test.id,
          {
            attempts: attempts.length,
            bestPercentage: bestAttempt?.percentage ?? null,
          },
        ];
      }),
    ),
    [practiceTests],
  );

  if (isLoading && (modules.length === 0 || practiceTests.length === 0)) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-20">
          <div className="glass-card mx-auto max-w-2xl rounded-3xl p-8 text-center">
            <h1 className="font-heading text-2xl font-semibold text-foreground">Loading dashboard content</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pulling modules, lessons, and practice tests from Supabase.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (modules.length === 0 || practiceTests.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-20">
          <div className="glass-card mx-auto max-w-2xl rounded-3xl p-8 text-center">
            <h1 className="font-heading text-2xl font-semibold text-foreground">No course content found</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Supabase did not return the training metadata yet. Recheck your content tables, seed data, and read policies.
            </p>
            {contentError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
                <p className="font-semibold">Supabase error</p>
                <p className="mt-1 break-words">{contentError}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const moduleProgress = getAllModuleProgress();
  const accessibleModules = modules.filter((mod) => canAccessModule(mod.id));
  const accessibleTests = practiceTests.filter((test) => canAccessTest(test.id));
  const previewModule = modules.find((mod) => mod.id === FREE_PREVIEW_MODULE_ID) ?? modules[0];
  const previewTest = practiceTests.find((test) => test.id === FREE_PREVIEW_TEST_ID) ?? practiceTests[0];
  const firstAccessibleModule = accessibleModules[0] ?? previewModule;
  const firstAccessibleTest = accessibleTests[0] ?? previewTest;

  const completedModuleCount = modules.filter((mod) =>
    isModuleFullyCompleted(moduleProgress[mod.id], mod.lessons.length),
  ).length;
  const totalAttempts = getTotalPracticeAttempts();
  const averageBestScore = practiceTests.reduce((total, test) => total + (testMeta[test.id]?.bestPercentage ?? 0), 0);
  const bestScoreCoverage = Object.values(testMeta).filter((entry) => entry.bestPercentage !== null).length;

  const nextModule =
    accessibleModules.find((mod) => {
      const progress = moduleProgress[mod.id];
      return !isModuleFullyCompleted(progress, mod.lessons.length);
    }) ?? firstAccessibleModule;
  const nextModuleProgress = moduleProgress[nextModule.id];
  const nextLessonIndex = getResumeLessonIndex(
    nextModule.lessons.length,
    nextModuleProgress?.completedLessons.length ?? 0,
    nextModuleProgress?.lastLessonIndex ?? null,
  );
  const nextTest =
    accessibleTests.find((test) => (testMeta[test.id]?.attempts ?? 0) === 0) ?? firstAccessibleTest;
  const nextTestAttempts = testMeta[nextTest.id]?.attempts ?? 0;

  const nextStep = (() => {
    if (!nextModuleProgress?.started) {
      return {
        eyebrow: "Next step",
        title: `Start ${nextModule.title}`,
        body: `Begin with lesson 1 and work through the module in order before moving into the quiz checkpoint.`,
        cta: "Open module",
        action: () => navigate(`/module/${nextModule.id}?section=lessons&lesson=0`),
      };
    }

    if (!nextModuleProgress.quizCompleted && nextModuleProgress.completedLessons.length < nextModule.lessons.length) {
      const lessonTitle = nextModule.lessons[nextLessonIndex]?.title ?? "Resume your module";
      return {
        eyebrow: "Continue where you left off",
        title: lessonTitle,
        body: `Jump back into ${nextModule.title} at lesson ${nextLessonIndex + 1} and continue from your saved progress.`,
        cta: "Resume module",
        action: () => navigate(`/module/${nextModule.id}?section=lessons&lesson=${nextLessonIndex}`),
      };
    }

    if (!nextModuleProgress.quizCompleted || !isModuleFullyCompleted(nextModuleProgress, nextModule.lessons.length)) {
      return {
        eyebrow: nextModuleProgress.quizCompleted ? "One final pass" : "Ready for the checkpoint",
        title: nextModuleProgress.quizCompleted ? `Retake the ${nextModule.title} quiz` : `Take the ${nextModule.title} quiz`,
        body: nextModuleProgress.quizCompleted
          ? "This module only counts as completed when every lesson is marked done and the quiz score reaches 100%."
          : `Your lessons are marked complete, so the next step is the quiz checkpoint for this module.`,
        cta: nextModuleProgress.quizCompleted ? "Retry quiz" : "Open quiz",
        action: () => navigate(`/module/${nextModule.id}?section=quiz`),
      };
    }

    if (nextTestAttempts === 0) {
      return {
        eyebrow: "Next recommended action",
        title: `Start ${nextTest.title}`,
        body: `You have completed the current module work. Move into your next available timed test and start building attempt history.`,
        cta: "Open test",
        action: () => navigate(`/test/${nextTest.id}`),
      };
    }

    if (accessibleModules.every((mod) => isModuleFullyCompleted(moduleProgress[mod.id], mod.lessons.length))) {
      if (isFreePreviewMode()) {
        return {
          eyebrow: "Keep building momentum",
          title: "Unlock the next timed test",
          body: "You have finished the free preview path. Upgrade to premium to open the next timed test and the rest of the study library.",
          cta: "Upgrade now",
          action: () => navigate("/signup?step=plan"),
        };
      }

      return {
        eyebrow: "Keep building momentum",
        title: `Revisit ${nextTest.title}`,
        body: `Pick up from your available timed practice, review prior attempts, and push your best score higher.`,
        cta: "Resume test",
        action: () => navigate(`/test/${nextTest.id}`),
      };
    }

    return {
      eyebrow: "Preview completed",
      title: "Unlock the rest of the study path",
      body: "You have explored the free plan content. Premium access opens the remaining modules, quizzes, detailed feedback, and timed practice sets.",
      cta: "Choose plan",
      action: () => {
        navigate("/signup?step=plan");
      },
    };
  })();

  const stats = [
    { label: "Modules Completed", value: `${completedModuleCount}/${modules.length}`, icon: BookOpen },
    { label: "Tests Taken", value: `${totalAttempts}`, icon: BarChart3 },
    { label: "Tracked Best Avg", value: bestScoreCoverage > 0 ? `${Math.round(averageBestScore / bestScoreCoverage)}%` : "--", icon: Trophy },
    { label: "Access Window", value: "6 months", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        {checkoutNotice ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"
          >
            {checkoutNotice}
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="rounded-3xl bg-navy px-6 py-6 mb-8 text-primary-foreground shadow-xl"
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] uppercase text-primary-foreground/55 mb-2">{nextStep.eyebrow}</p>
              <h2 className="font-heading text-2xl font-semibold text-primary-foreground mb-2">{nextStep.title}</h2>
              <p className="text-sm text-primary-foreground/70 max-w-2xl mb-5">{nextStep.body}</p>
              <Button variant="hero" size="lg" onClick={nextStep.action}>
                {nextStep.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-primary-foreground/8 px-4 py-4 border border-primary-foreground/10">
                <p className="text-primary-foreground/55 mb-1">Current module</p>
                <p className="font-semibold text-primary-foreground">Module {nextModule.id}</p>
                <p className="text-primary-foreground/65 text-xs mt-1">
                  {nextModuleProgress?.quizCompleted
                    ? "Quiz finished"
                    : `${nextModuleProgress?.completedLessons.length ?? 0}/${nextModule.lessons.length} lessons marked`}
                </p>
              </div>
              <div className="rounded-2xl bg-primary-foreground/8 px-4 py-4 border border-primary-foreground/10">
                <p className="text-primary-foreground/55 mb-1">Current timed test</p>
                <p className="font-semibold text-primary-foreground">{nextTest.title}</p>
                <p className="text-primary-foreground/65 text-xs mt-1">{nextTestAttempts} attempt{nextTestAttempts === 1 ? "" : "s"}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8 max-w-md">
          {[
            { key: "modules" as Tab, label: "Training Modules", icon: BookOpen },
            { key: "tests" as Tab, label: "Practice Tests", icon: Timer },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "modules" ? (
            <motion.div
              key="modules"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {modules.map((mod, index) => {
                  const accessible = canAccessModule(mod.id);
                  const progress = moduleProgress[mod.id];
                  const completedLessons = progress?.completedLessons.length ?? 0;
                  const isComplete = isModuleFullyCompleted(progress, mod.lessons.length);
                  const completion = getModuleCompletion(
                    mod.lessons.length,
                    completedLessons,
                    Boolean(progress?.quizCompleted),
                    progress?.quizScore ?? null,
                    progress?.quizTotal ?? null,
                    isComplete,
                  );

                  return (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`rounded-xl p-5 flex items-start gap-4 transition-all duration-200 text-left group ${
                        isComplete
                          ? "border border-emerald-200 bg-emerald-50 shadow-sm"
                          : "glass-card"
                      } ${accessible ? "hover:border-accent/30 hover:shadow-lg cursor-pointer" : "opacity-95"
                      }`}
                      onClick={() => {
                        if (accessible) {
                          navigate(`/module/${mod.id}`);
                        }
                      }}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${
                        isComplete ? "bg-emerald-600" : "gradient-accent"
                      }`}>
                        {isComplete ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <mod.icon className="h-6 w-6 text-accent-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-xs font-semibold ${isComplete ? "text-emerald-700" : "text-accent"}`}>Module {mod.id}</p>
                          {isComplete && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" /> Complete
                            </span>
                          )}
                          {!accessible && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
                              <LockKeyhole className="h-3 w-3" /> Locked
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-foreground mb-1 leading-snug">{mod.title}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {mod.lessons.length} lessons</span>
                          <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" /> {mod.quiz.length} quiz Qs</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {mod.lessons.reduce((total, lesson) => total + parseInt(lesson.duration, 10), 0)} min</span>
                        </div>
                        <div className="mb-3">
                          <div className="mb-1.5 flex items-center justify-between text-[11px]">
                            <span className={isComplete ? "font-semibold text-emerald-700" : "text-muted-foreground"}>
                              {isComplete ? "Fully completed" : "Completion"}
                            </span>
                            <span className={isComplete ? "font-semibold text-emerald-700" : "font-semibold text-foreground"}>
                              {completion}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all ${isComplete ? "bg-emerald-500" : "gradient-accent"}`}
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                        </div>
                        {(() => {
                          const moduleMessage = accessible
                            ? isComplete
                              ? null
                              : progress?.quizCompleted
                                ? null
                                : progress?.started
                                  ? `Resume from lesson ${(progress.lastLessonIndex ?? 0) + 1} or move into the quiz when ready.`
                                  : null
                            : "Unlock full access to open this module and its quiz.";

                          return moduleMessage ? <p className="text-sm text-muted-foreground">{moduleMessage}</p> : null;
                        })()}
                      </div>
                      {accessible ? (
                        <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
                      ) : (
                        <a href="/signup?step=plan" className="ml-auto">
                          <Button variant="locked" size="sm">Unlock</Button>
                        </a>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-muted-foreground mb-6">
                Free accounts can access limited timed practice. The remaining timed tests are shown here as part of the premium library so the upgrade path stays clear.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {practiceTests.map((test, index) => {
                  const meta = testMeta[test.id] ?? { attempts: 0, bestPercentage: null };
                  const accessible = canAccessTest(test.id);

                  return (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card rounded-2xl p-6 hover:border-accent/30 hover:shadow-lg transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-11 h-11 rounded-lg bg-navy flex items-center justify-center">
                          <test.icon className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex items-center gap-2">
                          {!accessible && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
                              <LockKeyhole className="h-3 w-3" /> Locked
                            </span>
                          )}
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{test.category}</span>
                        </div>
                      </div>

                      <h3 className="font-heading font-semibold text-foreground mb-1">{test.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{test.description}</p>

                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="rounded-xl bg-muted/70 px-3 py-3 text-xs">
                          <p className="text-muted-foreground mb-1">Format</p>
                          <p className="font-semibold text-foreground flex items-center gap-1"><Timer className="h-3.5 w-3.5 text-accent" /> {test.time} min</p>
                        </div>
                        <div className="rounded-xl bg-muted/70 px-3 py-3 text-xs">
                          <p className="text-muted-foreground mb-1">Questions</p>
                          <p className="font-semibold text-foreground flex items-center gap-1"><Target className="h-3.5 w-3.5 text-accent" /> {test.testQuestions.length}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-card p-4 mb-5">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">Attempt history</p>
                          <span className="text-xs font-semibold text-foreground">{meta.attempts} total</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Best score</span>
                          <span className="font-semibold text-foreground">{meta.bestPercentage !== null ? `${meta.bestPercentage}%` : "No attempts yet"}</span>
                        </div>
                      </div>

                      {accessible ? (
                        <Button variant="hero" size="sm" className="w-full" onClick={() => navigate(`/test/${test.id}`)}>
                          <Play className="h-4 w-4 mr-1" />
                          Open Test
                        </Button>
                      ) : (
                        <a href="/signup?step=plan" className="block">
                          <Button variant="locked" size="sm" className="w-full">
                            Unlock Full Library
                          </Button>
                        </a>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
