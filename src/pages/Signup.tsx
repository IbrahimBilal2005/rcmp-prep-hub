import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronRight, Crown, LockKeyhole, Mail, UserRound } from "lucide-react";
import BrandLockup from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { billingPlans, freePlan, premiumPlan } from "@/data/billingPlans";
import { activatePlan } from "@/services/billing/service";
import type { AccountPlan, AuthSession } from "@/services/auth/types";
import { getAuthSession, saveAuthSession, signInWithEmail, signUpWithEmail } from "@/services/auth/service";

type Mode = "signup" | "login";
type Step = "account" | "plan";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [storedSession] = useState(() => getAuthSession());
  const modeParam = searchParams.get("mode");
  const stepParam = searchParams.get("step");
  const checkoutParam = searchParams.get("checkout");

  const [mode, setMode] = useState<Mode>(modeParam === "login" ? "login" : "signup");
  const [step, setStep] = useState<Step>("account");
  const [name, setName] = useState(storedSession?.name ?? "");
  const [email, setEmail] = useState(storedSession?.email ?? "");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<AccountPlan | null>(null);
  const [pendingProfile, setPendingProfile] = useState<Omit<AuthSession, "plan"> | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(modeParam === "login" ? "login" : "signup");
    setStep(stepParam === "plan" && storedSession ? "plan" : "account");
    setSelectedPlan(null);
    setPendingProfile(
      stepParam === "plan" && storedSession
        ? {
            name: storedSession.name,
            email: storedSession.email,
            createdAt: storedSession.createdAt,
          }
        : null,
    );
    setError(checkoutParam === "cancelled" ? "Checkout was cancelled. You can choose a plan again whenever you're ready." : "");
  }, [checkoutParam, modeParam, stepParam, storedSession]);

  const handleAccountSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) {
        throw new Error(mode === "signup" ? "Enter your name, email, and password to continue." : "Enter your email and password to continue.");
      }

      if (mode === "login") {
        const session = await signInWithEmail({ email, password });
        saveAuthSession(session);
        navigate(session.role === "admin" ? "/admin" : "/dashboard");
        return;
      }

      const profile = await signUpWithEmail({ name, email, password });
      saveAuthSession(profile);
      setPendingProfile(profile);
      setStep("plan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanSubmit = async () => {
    setError("");

    if (!selectedPlan || !pendingProfile) {
      setError("Choose a plan to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session: AuthSession = {
        ...pendingProfile,
        plan: selectedPlan,
      };

      const result = await activatePlan(selectedPlan, session);

      if (result.status === "activated") {
        saveAuthSession(session);
        navigate(session.role === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue with that plan right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-canvas">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="app-shell flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BrandLockup size="sm" subtitle="Account Setup" textClassName="text-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Back to site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="app-shell py-10">
        <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="panel-inverse p-7">
            <p className="text-xs font-semibold tracking-[0.24em] uppercase text-primary-foreground/55 mb-3">Account flow</p>
            <h1 className="font-heading text-3xl font-bold mb-4">Create your account, then choose your access.</h1>
            <p className="text-primary-foreground/72 leading-relaxed mb-6">
              The onboarding path is simple and consistent: sign up once, choose Free Plan or Premium Access, then enter the dashboard that matches your account.
            </p>

            <div className="space-y-4">
              {[
                { step: "1", title: "Create your account", desc: "Use email and password so your account is created directly in Supabase Auth." },
                { step: "2", title: "Choose your plan", desc: "Free Plan and Premium Access are both available after account creation." },
                { step: "3", title: "Enter the dashboard", desc: "Free shows the same UI with limits. Premium unlocks the full resource library." },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/6 p-4">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-primary-foreground/70 mt-1">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="panel p-6 sm:p-8">
            <div className="flex items-center gap-2 rounded-full bg-muted p-1 w-fit mb-8">
              {[
                { key: "signup" as Mode, label: "Create account" },
                { key: "login" as Mode, label: "Login" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setMode(item.key);
                    setStep("account");
                    setSelectedPlan(null);
                    setPendingProfile(null);
                    setError("");
                    setSearchParams({ mode: item.key });
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    mode === item.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {step === "account" ? (
              <form onSubmit={handleAccountSubmit} className="max-w-xl">
                <p className="text-xs font-semibold tracking-[0.24em] uppercase text-accent mb-2">
                  {mode === "login" ? "Login" : "Step 1 of 2"}
                </p>
                <h2 className="font-heading text-3xl font-bold text-foreground mb-3">
                  {mode === "login" ? "Log in to your account" : "Create your account"}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {mode === "login"
                    ? "Use the email and password attached to your existing account."
                    : "Create your account first. Plan selection happens on the next step so users always choose their access level intentionally."}
                </p>

                <div className="space-y-4">
                  {mode === "signup" && (
                    <label className="block">
                      <span className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-accent" /> Full name
                      </span>
                    <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Bilal Khan" className="bg-background/70" />
                  </label>
                  )}

                  <label className="block">
                    <span className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-accent" /> Email
                    </span>
                    <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" className="bg-background/70" />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <LockKeyhole className="h-4 w-4 text-accent" /> Password
                    </span>
                    <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" type="password" className="bg-background/70" />
                  </label>
                </div>

                {error && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mt-5">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button type="submit" variant="hero" size="lg" disabled={isSubmitting}>
                    {mode === "login" ? "Enter Dashboard" : "Continue To Plan Selection"}
                    {mode === "signup" && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] uppercase text-accent mb-2">Step 2 of 2</p>
                <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Choose your plan</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Both options lead into the same product experience. The difference is how much of the resource library and answer feedback your account can access.
                </p>

                <div className="grid gap-5 xl:grid-cols-2">
                  {billingPlans.map((plan) => {
                    const active = selectedPlan === plan.tier;
                    const isPremium = plan.tier === "premium";

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan.tier)}
                        className={`flex h-full flex-col rounded-3xl border p-7 text-left transition-all ${
                          active
                            ? isPremium
                              ? "border-accent/40 shadow-xl bg-card"
                              : "border-border shadow-lg bg-card"
                            : "border-border/70 hover:border-accent/20"
                        }`}
                      >
                        <div className="mb-5 flex min-h-[16.5rem] flex-col">
                          <div className="flex items-start justify-between gap-4">
                            <p className="pt-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent">{plan.accessLabel}</p>
                            {isPremium ? <Crown className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" /> : <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />}
                          </div>
                          <div className="mt-5 min-h-[2.75rem]">
                            <h3 className="font-heading text-3xl font-bold leading-[1.05] text-foreground">{plan.name}</h3>
                          </div>
                          <div className="mt-3 flex min-h-[3.5rem] items-end gap-2">
                            <span className="text-4xl font-heading font-bold leading-none text-foreground">{plan.priceLabel}</span>
                            <span className="pb-1 text-muted-foreground">{plan.currency}</span>
                          </div>
                          <div className="mt-3 min-h-[4.5rem]">
                            <p className="text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>
                          </div>
                        </div>

                        <div className={`${isPremium ? "mt-auto" : "mt-auto -translate-y-4"} space-y-3`}>
                          {plan.includes.map((item) => (
                            <div key={item} className="flex items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3">
                              <Check className="h-4 w-4 text-accent flex-shrink-0" />
                              <span className="text-sm text-foreground">{item}</span>
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mt-5">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Button variant="hero" size="lg" disabled={!selectedPlan || isSubmitting} onClick={handlePlanSubmit}>
                    {selectedPlan === premiumPlan.tier ? "Continue To Premium" : selectedPlan === freePlan.tier ? "Enter Free Plan" : "Choose A Plan To Continue"}
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setStep("account")} disabled={isSubmitting}>
                    Back
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Signup;
