import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const included = [
  "All 7 training modules",
  "Video lessons & strategies",
  "Unlimited practice quizzes",
  "Full RCMP simulation exams",
  "Timed test conditions",
  "Answer explanations",
  "Work style preparation",
  "6 months access",
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-wide uppercase">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mt-3 mb-4">
            One Price. Full Access.
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            No subscriptions or hidden fees. One purchase gives you everything you need.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="rounded-2xl border-2 border-accent/30 bg-card p-8 shadow-xl relative overflow-hidden">
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 gradient-accent" />

            <div className="text-center mb-8">
              <p className="text-sm font-semibold text-accent uppercase tracking-wide mb-2">Complete Platform</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-heading font-bold text-foreground">$59</span>
                <span className="text-muted-foreground text-lg">CAD</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">6 months of full access</p>
            </div>

            <div className="space-y-3 mb-8">
              {included.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-gold flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="xl" className="w-full">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
