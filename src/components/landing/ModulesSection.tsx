import { motion } from "framer-motion";
import { BookOpen, Brain, Calculator, FileText, Languages, MoveUpRight, Shapes, Users } from "lucide-react";
import DashboardPreviewDialog from "@/components/landing/DashboardPreviewDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const modules = [
  {
    icon: BookOpen,
    title: "Understanding the Test",
    desc: "Learn the test format, scoring, and strategic approach to maximize your results.",
    details:
      "This module covers how the aptitude exam is structured, how pacing affects outcomes, and what strong candidates do differently before they ever start answering questions.",
    includes: ["Exam structure and scoring", "Time-management strategy", "Test-day preparation habits"],
  },
  {
    icon: Calculator,
    title: "Numerical Skills",
    desc: "Master arithmetic, data interpretation, and number series with targeted practice.",
    details:
      "Focuses on the numerical reasoning patterns most likely to slow candidates down under pressure, with drills built around accuracy first and speed second.",
    includes: ["Arithmetic refreshers", "Data interpretation", "Series and pattern drills"],
  },
  {
    icon: Brain,
    title: "Memory & Observation",
    desc: "Develop techniques to recall details from images, text passages, and scenarios.",
    details:
      "Trains structured observation and short-term recall so you can capture details quickly without wasting time re-reading or second-guessing.",
    includes: ["Visual recall methods", "Text retention strategies", "Scenario-based observation practice"],
  },
  {
    icon: Shapes,
    title: "Spatial Reasoning",
    desc: "Practice pattern recognition, shape rotation, and visual-spatial problem solving.",
    details:
      "Builds confidence with rotation, folding, mirrors, and abstract pattern recognition using deliberate step-by-step approaches instead of guesswork.",
    includes: ["Pattern recognition", "Shape rotation", "2D and 3D spatial tasks"],
  },
  {
    icon: Languages,
    title: "Language & Logical Reasoning",
    desc: "Strengthen verbal comprehension, analogies, and logical deduction skills.",
    details:
      "Helps candidates read more precisely, identify flawed assumptions, and respond to language-heavy questions with clearer reasoning.",
    includes: ["Verbal comprehension", "Analogies and relationships", "Deduction and logic"],
  },
  {
    icon: FileText,
    title: "Full Practice Tests",
    desc: "Take timed, full-length RCMP simulation exams with detailed score breakdowns.",
    details:
      "Brings the full study path together through timed simulations that mirror test pressure, encourage stamina, and expose weak areas before exam day.",
    includes: ["Timed full-length simulations", "Score review", "Attempt history and comparison"],
  },
  {
    icon: Users,
    title: "Work Style & Professional Judgment",
    desc: "Prepare for situational and behavioral assessment with real-world scenarios.",
    details:
      "Covers professional judgment, accountability, and response quality in realistic scenarios aligned with law-enforcement expectations.",
    includes: ["Situational judgment prompts", "Professional conduct scenarios", "Work-style reflection"],
  },
];

const ModulesSection = () => {
  return (
    <section id="modules" className="section-wash scroll-mt-24 bg-transparent py-10 sm:scroll-mt-28 sm:py-12">
      <div className="app-shell">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] lg:items-end">
          <div>
            <span className="eyebrow">Training Modules</span>
            <h2 className="section-heading mt-5 max-w-4xl">
              <span className="block">Train every core skill</span>
              <span className="block text-gradient">with less friction.</span>
            </h2>
          </div>
          <p className="section-copy lg:ml-auto lg:max-w-sm">
            Seven structured modules covering every aspect of the RCMP aptitude test, from numerical skills to professional judgment.
          </p>
        </div>

        <div className="section-card">
          <div className="grid gap-5 lg:grid-cols-6">
            {modules.map((mod, i) => (
              <Dialog key={mod.title}>
                <DialogTrigger asChild>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className={`group glass-card rounded-[2rem] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent/20 sm:p-7 ${
                      i === 0 || i === 1
                        ? "lg:col-span-3"
                        : i >= 2 && i <= 4
                          ? "lg:col-span-2"
                          : i === 5
                            ? "lg:col-span-4"
                            : "lg:col-span-2"
                    }`}
                  >
                    <div className="mb-8 flex items-center justify-between gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-white/75 shadow-inner shadow-white/70 transition-transform duration-300 group-hover:scale-110">
                        <mod.icon className="h-6 w-6 text-accent" />
                      </div>
                      <span className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Module {i + 1}
                      </span>
                    </div>
                    <p className="mb-3 max-w-sm font-heading text-[2rem] font-semibold leading-[0.96] text-foreground">{mod.title}</p>
                    <p className="max-w-xl text-sm leading-7 text-muted-foreground">{mod.desc}</p>
                    <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-accent">
                      Explore focus area
                      <MoveUpRight className="h-4 w-4" />
                    </div>
                  </motion.button>
                </DialogTrigger>

                <DialogContent className="panel mesh-panel max-w-2xl rounded-[2rem] border-border/60 p-7 sm:p-8">
                  <DialogHeader className="space-y-4 text-left">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-white/75 shadow-inner shadow-white/70">
                      <mod.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">Module Detail</p>
                      <DialogTitle className="font-heading text-[2.2rem] font-semibold leading-[0.95] text-foreground">
                        {mod.title}
                      </DialogTitle>
                    </div>
                    <DialogDescription className="max-w-xl text-sm leading-7 text-muted-foreground">
                      {mod.details}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {mod.includes.map((item) => (
                      <div key={item} className="rounded-[1.35rem] border border-border/60 bg-white/65 px-4 py-4 text-sm text-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>

          <div className="mt-8">
            <DashboardPreviewDialog>
              <button
                type="button"
                className="group flex w-full items-center justify-between rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-left shadow-[0_16px_38px_-30px_rgba(22,101,52,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-100"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">Dashboard preview</p>
                  <p className="mt-2 text-base font-semibold text-emerald-900">See how modules, tests, and results look inside the actual study flow</p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  Open sample view
                  <MoveUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </button>
            </DashboardPreviewDialog>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
