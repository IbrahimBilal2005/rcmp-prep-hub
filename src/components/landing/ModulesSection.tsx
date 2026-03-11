import { motion } from "framer-motion";
import { BookOpen, Brain, Calculator, FileText, Languages, MoveUpRight, Shapes, Users } from "lucide-react";

const modules = [
  { icon: BookOpen, title: "Understanding the Test", desc: "Learn the test format, scoring, and strategic approach to maximize your results." },
  { icon: Calculator, title: "Numerical Skills", desc: "Master arithmetic, data interpretation, and number series with targeted practice." },
  { icon: Brain, title: "Memory & Observation", desc: "Develop techniques to recall details from images, text passages, and scenarios." },
  { icon: Shapes, title: "Spatial Reasoning", desc: "Practice pattern recognition, shape rotation, and visual-spatial problem solving." },
  { icon: Languages, title: "Language & Logical Reasoning", desc: "Strengthen verbal comprehension, analogies, and logical deduction skills." },
  { icon: FileText, title: "Full Practice Tests", desc: "Take timed, full-length RCMP simulation exams with detailed score breakdowns." },
  { icon: Users, title: "Work Style & Professional Judgment", desc: "Prepare for situational and behavioral assessment with real-world scenarios." },
];

const ModulesSection = () => {
  return (
    <section id="modules" className="section-wash scroll-mt-24 bg-transparent py-10 sm:scroll-mt-28 sm:py-12">
      <div className="app-shell">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] lg:items-end">
          <div>
            <span className="eyebrow">Training Modules</span>
            <h2 className="section-heading mt-5">
              Complete preparation without visual noise.
            </h2>
          </div>
          <p className="section-copy lg:ml-auto lg:max-w-sm">
            Seven structured modules covering every aspect of the RCMP aptitude test, from numerical skills to professional judgment.
          </p>
        </div>

        <div className="section-card">
          <div className="grid gap-5 lg:grid-cols-6">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`group glass-card rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/20 sm:p-7 ${
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
