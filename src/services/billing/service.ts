import { appConfig } from "@/config/app";
import type { AccountPlan, AuthSession } from "@/services/auth/types";

export interface BillingResult {
  status: "activated" | "redirected";
}

const buildCheckoutUrl = (session: AuthSession) => {
  if (!appConfig.stripeCheckoutUrl) {
    return null;
  }

  const url = new URL(appConfig.stripeCheckoutUrl);
  url.searchParams.set("prefilled_email", session.email);
  url.searchParams.set("client_reference_id", session.email);
  return url.toString();
};

export const activatePlan = async (plan: AccountPlan, session: AuthSession): Promise<BillingResult> => {
  if (plan === "free" || appConfig.useMockBilling) {
    return { status: "activated" };
  }

  const checkoutUrl = buildCheckoutUrl(session);
  if (!checkoutUrl) {
    throw new Error("Stripe checkout is not configured yet. Set VITE_STRIPE_CHECKOUT_URL or enable mock billing.");
  }

  window.location.assign(checkoutUrl);
  return { status: "redirected" };
};
