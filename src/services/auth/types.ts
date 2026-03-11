export type AccountPlan = "free" | "premium";

export interface AuthSession {
  name: string;
  email: string;
  plan: AccountPlan;
  createdAt: string;
}

export interface AccountCredentials {
  name?: string;
  email: string;
  password: string;
}
