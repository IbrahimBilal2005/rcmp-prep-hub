export type { AccountPlan, AuthSession } from "@/services/auth/types";
export {
  clearAuthSession,
  getAuthSession,
  initializeAuthSession,
  isAuthenticated,
  saveAuthSession,
  signInWithEmail,
  signUpWithEmail,
  subscribeToAuthChanges,
} from "@/services/auth/service";
