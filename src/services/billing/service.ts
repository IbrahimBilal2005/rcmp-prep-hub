import { appConfig } from "@/config/app";
import type { AccountPlan, AuthSession } from "@/services/auth/types";
import { supabase } from "@/services/supabase/client";

export interface BillingResult {
  status: "activated" | "redirected";
}

export const activatePlan = async (plan: AccountPlan, session: AuthSession): Promise<BillingResult> => {
  if (plan === "free") {
    return { status: "activated" };
  }

  if (appConfig.useMockBilling) {
    throw new Error("Premium checkout is not available until Stripe billing is configured.");
  }

  if (!supabase) {
    throw new Error("Supabase is not configured for Stripe checkout.");
  }

  if (!appConfig.stripePriceSixMonthAccess) {
    throw new Error("Stripe price is not configured yet. Set VITE_STRIPE_PRICE_6_MONTHS.");
  }

  const { data: authData, error: authError } = await supabase.auth.getSession();
  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.session?.access_token) {
    throw new Error("You need an active signed-in session before starting checkout. Log in and try again.");
  }

  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: {
      priceId: appConfig.stripePriceSixMonthAccess,
      plan,
      userId: session.id,
      email: session.email,
    },
  });

  const payload = data as { url?: string; error?: string } | null;

  if (error || !payload?.url) {
    throw new Error(payload?.error || error?.message || "Unable to create Stripe checkout session.");
  }

  window.location.assign(payload.url);
  return { status: "redirected" };
};
