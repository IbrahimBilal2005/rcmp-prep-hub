import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const highlights = [
  "7 comprehensive training modules",
  "Full RCMP simulation exams",
  "Timed practice with explanations",
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] gradient-hero flex items-center overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              🎯 RCMP Aptitude Test Prep
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight mb-6"
          >
            Master the RCMP
            <br />
            <span className="text-gradient">Aptitude Test</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-primary-foreground/60 mb-8 max-w-xl leading-relaxed"
          >
            Structured training modules, practice exams, and expert strategies 
            designed to help you succeed in the RCMP aptitude assessment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-10"
          >
            <a href="#pricing">
              <Button variant="hero" size="xl">
                Start Training — $59 CAD
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href="#modules">
              <Button variant="heroOutline" size="xl">
                View Modules
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-3"
          >
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-gold flex-shrink-0" />
                <span className="text-sm text-primary-foreground/50">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
