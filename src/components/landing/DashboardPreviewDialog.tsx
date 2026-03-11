import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, HelpCircle, Play, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { modules, practiceTests } from "@/data/courseData";

interface DashboardPreviewDialogProps {
  children: ReactNode;
}

const DashboardPreviewDialog = ({ children }: DashboardPreviewDialogProps) => {
  const featuredModule = modules[1];
  const modulePreviewLessons = featuredModule?.lessons.slice(0, 3) ?? [];
  const featuredTest = practiceTests[0];
  const reviewTest = practiceTests[1];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[88vh] max-w-6xl overflow-y-auto rounded-[2rem] border border-border/70 bg-background/95 p-0 shadow-[0_32px_90px_-42px_rgba(8,18,24,0.72)]">
        <div className="p-7 sm:p-8">
          <DialogHeader className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Sample dashboard preview</p>
            <DialogTitle className="font-heading text-3xl font-semibold text-foreground sm:text-[2.35rem]">
              See the dashboard as a clear study flow
            </DialogTitle>
            <DialogDescription className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              The dashboard is structured to move learners through a practical sequence: choose from the dashboard, learn from module content, complete the module quiz, move into a timed test, then review results and progress history.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {[
              "Choose from training modules",
              "Choose from multiple practice tests",
              "Learn the module content",
              "Take the module quiz",
              "Take the timed test",
              "Review results and progress",
            ].map((step, index) => (
              <div key={step} className="rounded-2xl border border-border/70 bg-white/70 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Step {index + 1}</p>
                <p className="mt-2 text-sm font-medium text-foreground">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <div className="glass-card rounded-3xl border border-border/70 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Step 1</p>
                  <p className="mt-2 font-heading text-2xl font-semibold text-foreground">Choose from training modules</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Dashboard grid
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {modules.slice(0, 4).map((module, index) => (
                  <div
                    key={module.id}
                    className={`min-h-[9.25rem] rounded-xl p-5 flex items-start gap-4 ${
                      index === 0 ? "border border-emerald-200 bg-emerald-50 shadow-sm" : "glass-card"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      index === 0 ? "bg-emerald-600" : "gradient-accent"
                    }`}>
                      {index === 0 ? (
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      ) : (
                        <module.icon className="h-6 w-6 text-accent-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-xs font-semibold ${index === 0 ? "text-emerald-700" : "text-accent"}`}>Module {module.id}</p>
                        {index === 2 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
                            Locked
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-foreground leading-snug">{module.title}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {module.lessons.length}</span>
                        <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" /> {module.quiz.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl border border-border/70 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Step 2</p>
                  <p className="mt-2 font-heading text-2xl font-semibold text-foreground">Choose from multiple practice tests</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Test library
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {practiceTests.slice(0, 4).map((test, index) => (
                  <div
                    key={test.id}
                    className={`min-h-[9.25rem] rounded-xl p-5 flex items-start gap-4 ${
                      index === 0 ? "border border-emerald-200 bg-emerald-50 shadow-sm" : "glass-card"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      index === 0 ? "bg-emerald-600" : "bg-navy"
                    }`}>
                      {index === 0 ? (
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      ) : (
                        <test.icon className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-xs font-semibold ${index === 0 ? "text-emerald-700" : "text-accent"}`}>{test.category}</p>
                        {index >= 2 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
                            Locked
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-foreground leading-snug">{test.title}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{test.time} min</span>
                        <span>{test.testQuestions.length} questions</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl border border-border/70 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Step 3</p>
                  <p className="mt-2 font-heading text-2xl font-semibold text-foreground">Learn from the module content</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Module view
                </span>
              </div>

              <div className="mb-6">
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl gradient-accent">
                    {featuredModule && <featuredModule.icon className="h-7 w-7 text-accent-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-accent">Module {featuredModule?.id}</p>
                    <h3 className="font-heading text-2xl font-bold text-foreground">{featuredModule?.title}</h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{featuredModule?.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {featuredModule?.lessons.length} lessons</span>
                  <span className="flex items-center gap-1"><HelpCircle className="h-4 w-4" /> {featuredModule?.quiz.length} quiz questions</span>
                  <span className="flex items-center gap-1"><Clock3 className="h-4 w-4" /> Saved progress</span>
                </div>
                <div className="mt-5 rounded-2xl bg-muted/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">Module progress</p>
                    <p className="text-sm text-muted-foreground">3/{featuredModule?.lessons.length} lessons completed</p>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-background">
                    <div className="h-full w-[38%] rounded-full gradient-accent" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {modulePreviewLessons.map((lesson, index) => (
                  <div key={lesson.title} className="glass-card rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Play className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock3 className="h-3 w-3" /> {lesson.duration}
                      </p>
                    </div>
                    <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${index === 0 ? "text-green-500" : "text-muted-foreground/40"}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl border border-border/70 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Step 4</p>
                  <p className="mt-2 font-heading text-2xl font-semibold text-foreground">Take the module quiz</p>
                </div>
                <div className="rounded-2xl bg-muted/70 px-4 py-3 text-sm">
                  <p className="text-muted-foreground mb-1">Status</p>
                  <p className="font-semibold text-foreground">Ready</p>
                </div>
              </div>

              <div className="rounded-2xl bg-muted/50 border border-border/60 p-6">
                <p className="text-xs font-semibold tracking-[0.24em] uppercase text-accent mb-2">Module Quiz</p>
                <h3 className="font-heading text-2xl font-semibold text-foreground">Knowledge Check</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Test your understanding of the material covered in this module before moving into broader timed testing.
                </p>

                <div className="mt-6 rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Question 1 of {featuredModule?.quiz.length}</span>
                    <span className="text-sm text-muted-foreground">Untimed</span>
                  </div>
                  <p className="font-semibold text-foreground mb-4">
                    {featuredModule?.quiz[0]?.question}
                  </p>
                  <div className="space-y-3">
                    {(featuredModule?.quiz[0]?.options ?? []).slice(0, 4).map((option, index) => (
                      <div key={option} className="w-full text-left rounded-2xl p-4 flex items-center gap-3 border border-border/60 bg-card">
                        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 bg-muted text-muted-foreground">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-foreground font-medium">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <Button variant="hero" size="lg">
                    Start Quiz
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-border/70 bg-background shadow-xl">
              <div className="bg-navy border-b border-navy-light/30 px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-primary-foreground/50 mb-1">Timed practice test</p>
                  <p className="font-heading text-sm sm:text-base font-semibold text-primary-foreground truncate">{featuredTest?.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:flex items-center gap-1.5 font-mono text-sm font-bold text-white">
                    <Timer className="h-4 w-4" />
                    11:42
                  </span>
                  <Button variant="hero" size="sm">Submit (3/{featuredTest?.testQuestions.length})</Button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Step 5</p>
                    <p className="mt-2 font-heading text-2xl font-semibold text-foreground">Take the timed test</p>
                  </div>
                  <div className="rounded-xl bg-muted/80 px-3 py-2 text-sm text-muted-foreground">3 answered</div>
                </div>

                <div className="glass-card rounded-3xl border border-border/70 p-6">
                  <p className="text-xs font-semibold tracking-[0.24em] uppercase text-muted-foreground mb-2">
                    Question 4 of {featuredTest?.testQuestions.length}
                  </p>
                  <h3 className="font-heading text-2xl font-semibold text-foreground leading-tight">
                    {featuredTest?.testQuestions[3]?.question ?? featuredTest?.testQuestions[0]?.question}
                  </h3>

                  <div className="w-full rounded-full bg-muted h-2 overflow-hidden my-6">
                    <div className="h-full w-[36%] gradient-accent rounded-full" />
                  </div>

                  <div className="space-y-3">
                    {(featuredTest?.testQuestions[3]?.options ?? featuredTest?.testQuestions[0]?.options ?? []).slice(0, 4).map((option, index) => (
                      <div
                        key={option}
                        className={`w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 ${
                          index === 1 ? "border-2 border-accent bg-accent/5 shadow-sm" : "border border-border/60 bg-card"
                        }`}
                      >
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                          index === 1 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-foreground font-medium">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl border border-border/70 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Step 6</p>
                  <p className="mt-2 font-heading text-2xl font-semibold text-foreground">See results and review</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Saved history
                </span>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
                <p className="text-sm text-emerald-700 mb-1">Best completed score</p>
                <p className="text-3xl font-heading font-bold mb-2">82%</p>
                <p className="text-sm text-emerald-800/80">9/11 correct in 12m 14s</p>
              </div>

              <div className="mt-4 rounded-2xl border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">Attempt history</p>
                  <span className="text-xs font-semibold text-foreground">4 total</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{reviewTest?.title}</span>
                  <span className="font-semibold text-foreground">82%</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-border/60 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">What this view offers</p>
                  <div className="mt-3 space-y-2 text-sm text-foreground">
                    <p>Best-result tracking after completed attempts.</p>
                    <p>Saved attempt history for repeat practice.</p>
                    <p>Review loops that show improvement over time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup?mode=signup" className="flex-1">
              <Button variant="hero" size="lg" className="w-full">
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#modules" className="flex-1">
              <Button variant="heroOutline" size="lg" className="w-full">
                Explore Full Module List
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardPreviewDialog;
