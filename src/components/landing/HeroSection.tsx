import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Timer, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardPreviewDialog from "@/components/landing/DashboardPreviewDialog";
import logoMark from "@/assets/logo-mark.png";

const heroStats = [
  { label: "Focused modules", value: "7", icon: BookOpen },
  { label: "Timed simulations", value: "Real exam flow", icon: Timer },
  { label: "Progress tracking", value: "Saved history", icon: Trophy },
];

const HeroSection = () => {
  return (
    <section className="section-wash gradient-hero relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(27,53,64,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(27,53,64,0.04)_1px,transparent_1px)] [background-size:110px_110px]" />
        <div className="absolute inset-x-0 top-0 h-[640px] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(252,249,244,0.4)_45%,rgba(252,249,244,0)_100%)]" />
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-0 top-14 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -right-20 top-24 hidden w-[420px] opacity-[0.04] lg:block">
          <img src={logoMark} alt="" aria-hidden="true" className="h-auto w-full" />
        </div>
        <div className="absolute bottom-0 left-[-4rem] hidden w-[300px] opacity-[0.03] lg:block">
          <img src={logoMark} alt="" aria-hidden="true" className="h-auto w-full" />
        </div>
      </div>

      <div className="app-shell relative z-10 pb-12 sm:pb-16 lg:pb-24">
        <div className="grid items-end gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,30rem)] xl:gap-14">
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex max-w-5xl flex-col gap-2 pb-3 font-semibold leading-[1] tracking-[-0.03em] text-foreground"
            >
              <span className="block whitespace-nowrap text-[3.35rem] sm:text-[4.45rem] lg:text-[5.45rem]">Prepare smarter.</span>
              <span className="block whitespace-nowrap text-[3.6rem] text-gradient sm:text-[4.82rem] lg:text-[5.68rem]">Perform better.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 max-w-xl"
            >
              <p className="section-copy text-[1.04rem]">
                A focused RCMP-style study environment with guided modules, timed practice, and review tools designed to keep your next move clear without clutter or noise.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link to="/signup?mode=signup">
                <Button variant="hero" size="xl">
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#modules">
                <Button variant="heroOutline" size="xl">
                  Explore Modules
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid gap-4 sm:grid-cols-3"
            >
              {heroStats.map((stat) => (
                <div key={stat.label} className="glass-card rounded-[1.8rem] p-5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/65 shadow-inner shadow-white/60">
                    <stat.icon className="h-5 w-5 text-accent" />
                  </div>
                  <p className="font-heading text-[1.8rem] font-semibold leading-none text-foreground">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative xl:-translate-y-10"
          >
            <DashboardPreviewDialog>
                <button type="button" className="group block w-full text-left">
                  <div className="panel mesh-panel rounded-[2.4rem] p-6 transition-transform duration-300 group-hover:-translate-y-1 sm:p-7">
                    <div className="rounded-[1.9rem] border border-white/70 bg-white/55 p-5 backdrop-blur-xl transition-colors duration-300 group-hover:bg-white/64">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Study cadence</span>
                        <span className="rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Premium flow</span>
                      </div>
                      <div className="mt-7 space-y-5">
                        <div className="rounded-[1.6rem] bg-navy px-5 py-5 text-primary-foreground shadow-[0_18px_50px_-32px_rgba(4,16,24,0.72)]">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-primary-foreground/60">Current focus</p>
                          <p className="mt-3 font-heading text-4xl font-semibold">Timed simulation</p>
                          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-[68%] rounded-full gradient-gold" />
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm text-primary-foreground/68">
                            <span>17 questions completed</span>
                            <span>68% through</span>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-[1.5rem] border border-border/60 bg-white/70 p-4">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Average pace</p>
                            <p className="mt-3 font-heading text-3xl font-semibold text-foreground">1.8m</p>
                          </div>
                          <div className="rounded-[1.5rem] border border-border/60 bg-white/70 p-4">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Best streak</p>
                            <p className="mt-3 font-heading text-3xl font-semibold text-foreground">12</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm shadow-[0_14px_34px_-28px_rgba(22,101,52,0.35)]">
                          <span className="font-medium text-emerald-900">Take a look under the hood</span>
                          <span className="inline-flex items-center gap-2 text-emerald-700">
                            View details
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
            </DashboardPreviewDialog>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
