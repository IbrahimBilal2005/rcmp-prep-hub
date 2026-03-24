export type AccountPlan = "free" | "premium";
export type AccountRole = "user" | "admin";
export type AccountStatus = "active" | "invited" | "suspended";

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  plan: AccountPlan;
  role: AccountRole;
  status: AccountStatus;
  createdAt: string;
}

export interface AccountCredentials {
  name?: string;
  email: string;
  password: string;
}
