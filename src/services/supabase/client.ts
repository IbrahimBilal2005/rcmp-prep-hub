import { createClient } from "@supabase/supabase-js";
import { appConfig, integrationStatus } from "@/config/app";

export const supabase =
  integrationStatus.supabaseReady
    ? createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true,
        },
      })
    : null;
