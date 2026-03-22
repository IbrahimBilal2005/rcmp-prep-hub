import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Crown, Shield, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { billingPlans } from "@/data/billingPlans";
import { revealTransition, revealUp, revealViewport, revealVisible } from "@/lib/motion";

const PricingSection = () => {
  return (
    <section id="pricing" className="section-wash deferred-section scroll-mt-24 bg-transparent py-10 sm:scroll-mt-28 sm:py-12">
      <div className="app-shell">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-end">
          <div>
            <span className="eyebrow">Plans</span>
            <h2 className="section-heading mt-5 max-w-4xl">
              <span className="block">Start free.</span>
              <span className="block text-gradient">Upgrade when ready.</span>
            </h2>
          </div>
          <div className="lg:ml-auto lg:max-w-md">
            <div className="rounded-[1.45rem] border border-white/70 bg-white/40 px-5 py-5 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.2)] backdrop-blur-xl">
              <p className="text-[0.98rem] leading-7 text-foreground">
                &quot;I liked being able to start free, see the real dashboard, and only upgrade once I knew exactly what I was getting.&quot;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/10">
                  <User className="h-4 w-4 text-accent/75" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Jordan Hale</p>
                  <p className="text-xs text-muted-foreground">Free to premium path</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="mb-10 flex max-w-4xl flex-wrap items-center gap-3">
            <span className="glass-card rounded-full px-4 py-2 text-sm font-medium text-foreground">Clean onboarding</span>
            <span className="glass-card rounded-full px-4 py-2 text-sm font-medium text-foreground">Real dashboard access</span>
            <span className="glass-card rounded-full px-4 py-2 text-sm font-medium text-foreground">Upgrade only when ready</span>
          </div>

          <motion.div
            initial={revealUp}
            whileInView={revealVisible}
            viewport={revealViewport}
            transition={revealTransition()}
            className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]"
          >
            {billingPlans.map((plan) => {
              const isPremium = plan.tier === "premium";

              return (
                <div
                  key={plan.id}
                  className={`relative overflow-hidden rounded-[2.15rem] p-7 sm:p-8 ${
                    isPremium
                      ? "border border-navy-light/25 bg-[linear-gradient(180deg,hsl(202_38%_15%)_0%,hsl(202_44%_11%)_100%)] text-primary-foreground shadow-[0_32px_90px_-42px_rgba(8,18,24,0.72)]"
                      : "glass-card border border-border/70"
                  }`}
                >
                  {isPremium && (
                    <>
                      <div className="absolute left-0 right-0 top-0 h-1 gradient-accent" />
                      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
                    </>
                  )}

                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.24em] ${isPremium ? "text-white/82 [text-shadow:0_1px_10px_rgba(15,23,42,0.35)]" : "text-accent"}`}>{plan.accessLabel}</p>
                      <h3 className={`font-heading text-[2.4rem] font-semibold leading-none ${isPremium ? "text-primary-foreground" : "text-foreground"}`}>
                        {plan.name}
                      </h3>
                      <div className="mt-4 flex items-end gap-2">
                        <span className={`font-heading text-6xl font-semibold leading-none ${isPremium ? "text-primary-foreground" : "text-foreground"}`}>
                          {plan.priceLabel}
                        </span>
                        <span className={`pb-1 text-lg ${isPremium ? "text-primary-foreground/72" : "text-muted-foreground"}`}>
                          {plan.currency}
                        </span>
                      </div>
                      <p className={`mt-5 max-w-xl text-sm leading-relaxed ${isPremium ? "text-primary-foreground/72" : "text-muted-foreground"}`}>
                        {plan.summary}
                      </p>
                    </div>
                    {isPremium ? (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/8 shadow-[0_12px_30px_-18px_rgba(255,255,255,0.4)]">
                        <Crown className="h-[1.375rem] w-[1.375rem] text-white/88" />
                      </div>
                    ) : (
                      <Sparkles className="h-5 w-5 flex-shrink-0 text-accent" />
                    )}
                  </div>

                  {isPremium && (
                    <div className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-primary-foreground/74">
                      <Shield className="h-4 w-4 text-accent" />
                      Designed for the full prep journey
                    </div>
                  )}

                  <div className="mb-8 grid gap-3">
                    {plan.includes.map((item) => (
                      <div
                        key={item}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                          isPremium ? "border border-white/10 bg-white/5" : "bg-white/65"
                        }`}
                      >
                        <Check className="h-4 w-4 flex-shrink-0 text-accent" />
                        <span className={`text-sm ${isPremium ? "text-primary-foreground" : "text-foreground"}`}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/signup?mode=signup">
                    <Button variant={isPremium ? "hero" : "outline"} size="xl" className="w-full">
                      Create Account To Choose
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
