const env = import.meta.env;

export const appConfig = {
  appUrl: (env.VITE_APP_URL || window.location.origin).replace(/\/+$/, ""),
  sessionIdleMinutes: Number(env.VITE_SESSION_IDLE_MINUTES) > 0 ? Number(env.VITE_SESSION_IDLE_MINUTES) : 60,
  supabaseUrl: env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || "",
  stripePublishableKey: env.VITE_STRIPE_PUBLISHABLE_KEY || "",
  stripePriceSixMonthAccess: env.VITE_STRIPE_PRICE_6_MONTHS || "",
  useMockAuth: env.DEV && env.VITE_USE_MOCK_AUTH !== "false",
  useMockBilling: env.DEV && env.VITE_USE_MOCK_BILLING !== "false",
} as const;

export const integrationStatus = {
  supabaseReady: Boolean(appConfig.supabaseUrl && appConfig.supabaseAnonKey),
  stripeReady: Boolean(
    appConfig.stripePublishableKey && appConfig.stripePriceSixMonthAccess,
  ),
} as const;

export const phaseTwoReadiness = {
  authProvider: integrationStatus.supabaseReady ? "supabase-live" : "supabase-placeholder",
  billingProvider: integrationStatus.stripeReady ? "stripe-live" : "stripe-placeholder",
} as const;
