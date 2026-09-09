import { useEffect, useState, type ReactNode } from "react";
import { AUTH_SESSION_CHANGED_EVENT, getStoredAuthSession } from "@/services/auth/session-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient());
  useEffect(() => {
    const identity = () => {
      const session = getStoredAuthSession();
      return session ? `${session.id}:${session.role}:${session.plan}:${session.status}` : "signed-out";
    };
    let previous = identity();
    const handleAuth = () => {
      const next = identity();
      if (next !== previous) {
        previous = next;
        queryClient.clear();
      }
    };
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuth);
    return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuth);
  }, [queryClient]);
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {children}
    </TooltipProvider>
  </QueryClientProvider>
  );
};
