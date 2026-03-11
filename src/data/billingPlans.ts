export interface AccessPlan {
  id: string;
  tier: "free" | "premium";
  name: string;
  priceLabel: string;
  currency: string;
  accessLabel: string;
  stripeLookupKey: string | null;
  summary: string;
  includes: string[];
}

export const freePlan: AccessPlan = {
  id: "free-plan",
  tier: "free",
  name: "Free Plan",
  priceLabel: "$0",
  currency: "CAD",
  accessLabel: "Limited access",
  stripeLookupKey: null,
  summary: "Create an account, enter the real dashboard, and explore a limited portion of the training library before upgrading.",
  includes: [
    "Real dashboard layout",
    "Select lessons across available content",
    "Limited quiz access",
    "Limited timed practice access",
    "Locked premium resources remain visible",
    "Upgrade from inside the dashboard",
  ],
};

export const premiumPlan: AccessPlan = {
  id: "full-access-6-months",
  tier: "premium",
  name: "Premium Access",
  priceLabel: "$59",
  currency: "CAD",
  accessLabel: "6 months of full access",
  stripeLookupKey: "aptitudeforge_full_access_6_months",
  summary: "Structured prep, timed simulations, and full progress tracking in one focused RCMP aptitude program.",
  includes: [
    "All 7 training modules",
    "All lesson videos and strategies",
    "All module quiz questions",
    "All timed practice tests",
    "Detailed answer explanations",
    "Full review and progress flow",
    "Work style preparation",
    "6 months access",
  ],
};

export const billingPlans: AccessPlan[] = [freePlan, premiumPlan];
