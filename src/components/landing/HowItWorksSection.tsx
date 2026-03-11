import { motion } from "framer-motion";
import { UserPlus, BookOpen, Target, Trophy } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Sign Up & Purchase", desc: "One payment of $59 CAD unlocks the entire platform for 6 months." },
  { icon: BookOpen, title: "Study the Modules", desc: "Work through video lessons, strategies, and practice examples at your own pace." },
  { icon: Target, title: "Practice & Test", desc: "Take timed practice quizzes and full RCMP simulation exams with explanations." },
  { icon: Trophy, title: "Ace Your Test", desc: "Walk into your RCMP aptitude test prepared, confident, and ready to succeed." },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-wide uppercase">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mt-3 mb-4">
            Your Path to Success
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="relative mx-auto mb-6">
                <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center mx-auto">
                  <step.icon className="h-7 w-7 text-accent" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full gradient-gold flex items-center justify-center text-xs font-bold text-gold-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
