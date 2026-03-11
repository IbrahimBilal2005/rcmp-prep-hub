import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Clock3, ShieldCheck, Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const steps = [
  {
    icon: ShieldCheck,
    title: "Unlock your training hub",
    desc: "One purchase opens the full training experience, from study modules to timed test practice.",
    stat: "6 months access",
    details:
      "The platform is designed as a single training environment. Once access is unlocked, learners move from onboarding directly into study modules, quizzes, and timed practice without switching tools.",
    includes: ["Unified account flow", "Full training library", "Single dashboard experience"],
  },
  {
    icon: BookOpen,
    title: "Build fundamentals module by module",
    desc: "Move through lessons, quizzes, and reasoning drills in a sequence that reinforces both speed and confidence.",
    stat: "7 focused modules",
    details:
      "The modules are structured to reduce noise. Candidates can work through one focus area at a time, mark lessons complete, and build a more stable base before moving into more demanding test conditions.",
    includes: ["Lesson-by-lesson progression", "Tracked module progress", "Checkpoint quiz at the end of each module"],
  },
  {
    icon: Clock3,
    title: "Train under a real timer",
    desc: "Practice tests now run on timed attempts with a centered question layout and a dedicated progress rail that stays out of the way.",
    stat: "Timed simulations",
    details:
      "Once the fundamentals are in place, candidates can move into timed test conditions that simulate pressure more closely. The focus is on pacing, attempt history, and repeatable review.",
    includes: ["Timed attempts", "Saved scoring history", "Post-attempt review"],
  },
  {
    icon: Trophy,
    title: "Review, refine, repeat",
    desc: "See saved attempt history, inspect explanations, and raise your best score before test day arrives.",
    stat: "Past attempts tracked",
    details:
      "Improvement is not treated as a one-pass experience. The review loop is built to help users see where they are losing points, return to weak areas, and measure improvement over time.",
    includes: ["Best score tracking", "Review loop", "Repeat practice workflow"],
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-wash scroll-mt-24 bg-transparent py-10 sm:scroll-mt-28 sm:py-12">
      <div className="app-shell">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] lg:items-end">
          <div>
            <span className="eyebrow">How It Works</span>
            <h2 className="section-heading mt-5 max-w-4xl">
              <span className="block">Study with clarity.</span>
              <span className="block text-gradient">Perform under pressure.</span>
            </h2>
          </div>
          <p className="section-copy lg:ml-auto lg:max-w-sm">
            The flow moves from structured learning into realistic timed practice, giving you a clear study rhythm from first lesson to final simulation.
          </p>
        </div>

        <div className="section-card">
          <div className="grid gap-5 lg:grid-cols-2">
            {steps.map((step, index) => (
              <Dialog key={step.title}>
                <DialogTrigger asChild>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="glass-card rounded-[2rem] p-6 text-left sm:p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(230,237,247,0.42))] text-primary-foreground shadow-[0_18px_36px_-26px_rgba(17,27,44,0.24)] backdrop-blur-xl">
                          <step.icon className="h-5 w-5 text-accent/80" />
                        </div>
                        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(84,118,186,0.92),rgba(53,81,138,0.86))] text-[11px] font-semibold text-white shadow-[0_12px_24px_-16px_rgba(25,44,96,0.55)]">
                          {index + 1}
                        </span>
                      </div>
                      <ArrowUpRight className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                    </div>

                    <div className="mt-7">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="max-w-sm font-heading text-[2rem] font-semibold leading-[0.98] text-foreground">{step.title}</h3>
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{step.stat}</span>
                      </div>
                      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{step.desc}</p>
                    </div>
                  </motion.button>
                </DialogTrigger>

                <DialogContent className="panel mesh-panel max-w-2xl rounded-[2rem] border-border/60 p-7 sm:p-8">
                  <DialogHeader className="space-y-4 text-left">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(230,237,247,0.42))] shadow-[0_18px_36px_-26px_rgba(17,27,44,0.24)] backdrop-blur-xl">
                      <step.icon className="h-5 w-5 text-accent/80" />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">Step {index + 1}</p>
                      <DialogTitle className="font-heading text-[2.2rem] font-semibold leading-[0.95] text-foreground">
                        {step.title}
                      </DialogTitle>
                    </div>
                    <DialogDescription className="max-w-xl text-sm leading-7 text-muted-foreground">
                      {step.details}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {step.includes.map((item) => (
                      <div key={item} className="rounded-[1.35rem] border border-border/60 bg-white/65 px-4 py-4 text-sm text-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
