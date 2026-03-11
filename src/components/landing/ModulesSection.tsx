import { motion } from "framer-motion";
import { BookOpen, Calculator, Brain, Shapes, Languages, FileText, Users } from "lucide-react";

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
    <section id="modules" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-wide uppercase">Training Modules</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mt-3 mb-4">
            Complete RCMP Preparation
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Seven structured modules covering every aspect of the RCMP aptitude test, from numerical skills to professional judgment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group glass-card rounded-xl p-6 hover:shadow-lg hover:border-accent/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <mod.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-foreground text-lg mb-2">
                Module {i + 1}
              </h3>
              <p className="font-semibold text-foreground mb-1">{mod.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{mod.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
