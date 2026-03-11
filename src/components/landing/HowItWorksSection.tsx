import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Clock3, ShieldCheck, Trophy } from "lucide-react";

const steps = [
  {
    icon: ShieldCheck,
    title: "Unlock your training hub",
    desc: "One purchase opens the full training experience, from study modules to timed test practice.",
    stat: "6 months access",
  },
  {
    icon: BookOpen,
    title: "Build fundamentals module by module",
    desc: "Move through lessons, quizzes, and reasoning drills in a sequence that reinforces both speed and confidence.",
    stat: "7 focused modules",
  },
  {
    icon: Clock3,
    title: "Train under a real timer",
    desc: "Practice tests now run on timed attempts with a centered question layout and a dedicated progress rail that stays out of the way.",
    stat: "Timed simulations",
  },
  {
    icon: Trophy,
    title: "Review, refine, repeat",
    desc: "See saved attempt history, inspect explanations, and raise your best score before test day arrives.",
    stat: "Past attempts tracked",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-wash scroll-mt-24 bg-transparent py-10 sm:scroll-mt-28 sm:py-12">
      <div className="app-shell">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] lg:items-end">
          <div>
            <span className="eyebrow">How It Works</span>
            <h2 className="section-heading mt-5">
              Your path from calm study to realistic pressure.
            </h2>
          </div>
          <p className="section-copy lg:ml-auto lg:max-w-sm">
            The flow moves from structured learning into realistic timed practice, giving you a clear study rhythm from first lesson to final simulation.
          </p>
        </div>

        <div className="section-card">
          <div className="grid gap-5 lg:grid-cols-2">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="glass-card rounded-[2rem] p-6 sm:p-7"
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
