import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { canAccessModule, isPreviewLessonUnlocked } from "@/lib/access";
import { getModuleProgress, upsertModuleProgress } from "@/lib/moduleProgressStorage";
import { getEmptyCourseContent } from "@/services/content/service";
import { useCourseContent } from "@/services/content/useCourseContent";
import { persistModuleProgress } from "@/services/progress/supabase-sync";
import { resolveLessonAssetUrl } from "@/services/storage/lesson-assets";

const LessonView = () => {
  const { data: courseContent, isLoading } = useCourseContent();
  const modules = (courseContent ?? getEmptyCourseContent()).modules;
  const { id, lessonIndex } = useParams();
  const moduleId = Number(id);
  const lessonNumber = Number(lessonIndex);
  const mod = modules.find((entry) => entry.id === moduleId);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);
  const [resolvedPosterUrl, setResolvedPosterUrl] = useState<string | null>(null);

  if (isLoading && modules.length === 0) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-background">
        <DashboardHeader />
        <div className="container mx-auto max-w-5xl px-4 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold text-foreground mb-4">Loading lesson</h1>
            <p className="text-muted-foreground">Fetching lesson content from Supabase.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-background">
        <DashboardHeader />
        <div className="container mx-auto max-w-5xl px-4 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold text-foreground mb-4">Lesson not found</h1>
            <Link to="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isValidLessonIndex = Number.isInteger(lessonNumber) && lessonNumber >= 0 && lessonNumber < mod.lessons.length;
  const lesson = isValidLessonIndex ? mod.lessons[lessonNumber] : null;
  const moduleUnlocked = canAccessModule(moduleId);
  const lessonUnlocked = lesson ? moduleUnlocked && isPreviewLessonUnlocked(moduleId, lessonNumber) : false;

  useEffect(() => {
    const progress = getModuleProgress(moduleId);
    setCompletedLessons(progress?.completedLessons ?? []);

    if (!lesson || !lessonUnlocked) {
      return;
    }

    const next = upsertModuleProgress(moduleId, (current) => ({
      ...current,
      started: true,
      lastLessonIndex: lessonNumber,
      updatedAt: new Date().toISOString(),
    }));
    void persistModuleProgress(next);
    setCompletedLessons(next.completedLessons);
  }, [lesson, lessonNumber, lessonUnlocked, moduleId]);

  useEffect(() => {
    let active = true;

    void (async () => {
      if (!lesson) {
        if (active) {
          setResolvedVideoUrl(null);
          setResolvedPosterUrl(null);
        }
        return;
      }

      const [videoUrl, posterUrl] = await Promise.all([
        resolveLessonAssetUrl("video", lesson.videoUrl),
        resolveLessonAssetUrl("poster", lesson.posterUrl),
      ]);

      if (!active) {
        return;
      }

      setResolvedVideoUrl(videoUrl);
      setResolvedPosterUrl(posterUrl);
    })();

    return () => {
      active = false;
    };
  }, [lesson]);

  if (!lesson || !lessonUnlocked) {
    return <Navigate to={`/module/${moduleId}`} replace />;
  }

  const previousLessonIndex = lessonNumber > 0 ? lessonNumber - 1 : null;
  const nextLessonIndex = lessonNumber < mod.lessons.length - 1 ? lessonNumber + 1 : null;
  const nextLessonUnlocked = nextLessonIndex !== null && isPreviewLessonUnlocked(moduleId, nextLessonIndex);
  const completedCount = completedLessons.length;

  const toggleLessonComplete = (index: number) => {
    const next = upsertModuleProgress(moduleId, (current) => {
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

    void persistModuleProgress(next);
    setCompletedLessons(next.completedLessons);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <DashboardHeader />

      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <Link
          to={`/module/${moduleId}?lesson=${lessonNumber}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Module
        </Link>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card relative mx-auto w-full overflow-hidden rounded-[2rem] border border-border/70 p-5 sm:p-7"
            >
              <div className="pointer-events-none absolute inset-x-10 top-0 h-40 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative mb-5 rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-[0_24px_60px_-48px_rgba(17,27,44,0.65)] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                      Module {moduleId} · {lesson.chapterLabel}
                    </p>
                    <h1 className="mt-3 font-heading text-3xl font-bold leading-tight text-foreground sm:text-[2.15rem]">
                      {lesson.title}
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground">{mod.title}</p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/85 px-4 py-3 text-right shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Duration</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{lesson.duration}</p>
                  </div>
                </div>
              </div>

              {resolvedVideoUrl ? (
                <div className="max-w-full overflow-hidden rounded-[1.9rem] border border-border/70 bg-[#07111e] shadow-[0_28px_80px_-42px_rgba(17,27,44,0.82)]">
                  <video
                    key={resolvedVideoUrl}
                    controls
                    controlsList="nodownload"
                    preload="metadata"
                    poster={resolvedPosterUrl ?? undefined}
                    className="block aspect-video w-full max-w-full bg-[#07111e] object-contain"
                  >
                    <source src={resolvedVideoUrl} type="video/mp4" />
                    Your browser does not support embedded video playback.
                  </video>
                </div>
              ) : (
                <div
                  className="relative aspect-video overflow-hidden rounded-[1.9rem] border border-border/70 bg-[linear-gradient(180deg,hsl(214_62%_19%)_0%,hsl(210_58%_12%)_100%)] shadow-[0_28px_80px_-42px_rgba(17,27,44,0.82)]"
                  style={resolvedPosterUrl ? { backgroundImage: `url(${resolvedPosterUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_36%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,30,0.06)_0%,rgba(7,17,30,0.22)_48%,rgba(7,17,30,0.56)_100%)]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/95 text-navy shadow-[0_30px_65px_-30px_rgba(255,255,255,0.65)] transition-transform duration-200">
                      <PlayCircle className="h-11 w-11" />
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-5 sm:px-6 sm:pb-6">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">{lesson.chapterLabel}</p>
                      <p className="mt-2 text-lg font-semibold text-white sm:text-xl">{lesson.title}</p>
                    </div>
                    <div className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                      {lesson.duration}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 rounded-[1.75rem] border border-border/70 bg-card/95 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Summary</p>
                <p className="mt-3 text-base leading-8 text-muted-foreground">{lesson.summary}</p>
              </div>
            </motion.section>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between"
            >
              {previousLessonIndex !== null ? (
                <Link to={`/module/${moduleId}/lesson/${previousLessonIndex}`} className="block">
                  <Button variant="outline" size="lg" className="w-full sm:min-w-[220px]">
                    Previous
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="lg" className="w-full sm:min-w-[220px]" disabled>
                  Previous
                </Button>
              )}

              {nextLessonIndex !== null && nextLessonUnlocked ? (
                <Link to={`/module/${moduleId}/lesson/${nextLessonIndex}`} className="block">
                  <Button variant="hero" size="lg" className="w-full sm:min-w-[220px]">
                    Next
                  </Button>
                </Link>
              ) : (
                <Button variant="hero" size="lg" className="w-full sm:min-w-[220px]" disabled>
                  {nextLessonIndex === null ? "Done" : "Next"}
                </Button>
              )}
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-[2rem] border border-border/70 p-5 sm:p-6">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Lesson list</p>
                  <p className="mt-2 text-lg font-heading font-semibold text-foreground">{completedCount}/{mod.lessons.length} completed</p>
                </div>
                <div className="rounded-full bg-muted/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                  {mod.title}
                </div>
              </div>

              <div className="space-y-3 max-h-[24rem] overflow-y-auto pr-1">
                {mod.lessons.map((moduleLesson, index) => {
                  const unlocked = isPreviewLessonUnlocked(moduleId, index);
                  const active = index === lessonNumber;
                  const completed = completedLessons.includes(index);

                  if (!unlocked) {
                    return (
                      <div key={moduleLesson.title} className="rounded-[1.35rem] border border-border/60 bg-muted/40 px-4 py-3 opacity-75">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{moduleLesson.chapterLabel}</p>
                            <p className="mt-1 font-medium text-foreground truncate">{moduleLesson.title}</p>
                          </div>
                          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
                            Locked
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={moduleLesson.title}
                      className={`rounded-[1.35rem] border px-4 py-3 transition-all duration-200 ${
                        completed
                          ? "border-emerald-200 bg-emerald-50 shadow-[0_14px_28px_-22px_rgba(16,185,129,0.7)]"
                          : active
                            ? "border-accent/40 bg-accent/5 shadow-[0_18px_34px_-26px_rgba(27,94,158,0.55)]"
                            : "border-border/60 bg-card/95 hover:border-accent/20 hover:bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Link to={`/module/${moduleId}/lesson/${index}`} className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                                completed ? "text-emerald-700" : active ? "text-accent" : "text-muted-foreground"
                              }`}>
                                {moduleLesson.chapterLabel}
                              </p>
                              <p className={`mt-1 font-medium truncate ${completed ? "text-emerald-900" : "text-foreground"}`}>
                                {moduleLesson.title}
                              </p>
                            </div>
                            <span className={`text-xs ${completed ? "text-emerald-700" : "text-muted-foreground"}`}>
                              {moduleLesson.duration}
                            </span>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleLessonComplete(index)}
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                            completed
                              ? "border-emerald-200 bg-emerald-100 hover:bg-emerald-200/70"
                              : "border-border/70 bg-background hover:bg-muted"
                          }`}
                          aria-label={completed ? "Mark lesson incomplete" : "Mark lesson complete"}
                        >
                          {completed ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

export default LessonView;
