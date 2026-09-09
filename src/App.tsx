import SeoMetadata from "@/components/SeoMetadata";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { watchSessionActivity } from "@/services/auth/idle-session";
import { Suspense, createContext, lazy, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { clearAuthSession, getAuthSession, initializeAuthSession, isAuthenticated, subscribeToAuthChanges } from "@/lib/auth";
import { AppProviders } from "@/providers/AppProviders";
import { AUTH_SESSION_CHANGED_EVENT } from "@/services/auth/session-storage";

const Index = lazy(() => import("./pages/Index.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const ModuleDetail = lazy(() => import("./pages/ModuleDetail.tsx"));
const LessonView = lazy(() => import("./pages/LessonView.tsx"));
const PracticeTestView = lazy(() => import("./pages/PracticeTestView.tsx"));
const Signup = lazy(() => import("./pages/Signup.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const AuthVersionContext = createContext(0);

const RequireAuth = () => {
  useContext(AuthVersionContext);
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/signup?mode=login" state={{ from: location.pathname + location.search + location.hash }} replace />;
  }

  const session = getAuthSession();
  return <Outlet key={`${session.id}:${session.plan}:${session.role}:${session.status}`} />;
};

const RequireAdmin = () => {
  useContext(AuthVersionContext);
  const location = useLocation();
  const session = getAuthSession();

  if (!session || session.status === "suspended") {
    return <Navigate to="/signup?mode=login" state={{ from: location.pathname + location.search + location.hash }} replace />;
  }

  if (session.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }
    let id: string;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const scroll = () => {
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ block: "start" });
      return true;
    };
    if (scroll()) return;
    // Landing sections load lazily, so the anchor may not exist on first render.
    const observer = new MutationObserver(() => { if (scroll()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = setTimeout(() => observer.disconnect(), 10_000);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [pathname, hash]);

  return null;
};

const PageBoundary = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  return <RouteErrorBoundary key={pathname}>{children}</RouteErrorBoundary>;
};

const RouteFallback = () => <div className="min-h-screen bg-background" />;

const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
  const isHomepage = useLocation().pathname === "/";
  const [ready, setReady] = useState(false);
  const [authVersion, setAuthVersion] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let unsubscribe = () => undefined;
    const handleStoredSessionChange = () => {
      if (!active) {
        return;
      }

      setAuthVersion((current) => current + 1);
    };

    void (async () => {
      try {
        await initializeAuthSession();
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : "Unable to restore your session. Please reload to retry.");
        return;
      }

      if (!active) {
        return;
      }

      setReady(true);

      window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleStoredSessionChange);

      unsubscribe = subscribeToAuthChanges(() => {
        if (!active) {
          return;
        }

        setAuthVersion((current) => current + 1);
      });
    })();

    return () => {
      active = false;
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleStoredSessionChange);
      unsubscribe();
    };
  }, []);

  useEffect(() => watchSessionActivity(
    () => Boolean(getAuthSession()),
    () => { void clearAuthSession().catch(console.error); },
  ), []);

  if (error && !isHomepage) return <div className="min-h-screen flex flex-col items-center justify-center gap-4" role="alert"><p>{error}</p><button onClick={() => window.location.reload()}>Retry</button></div>;

  if (!ready && !isHomepage) {
    return <div className="min-h-screen bg-background" />;
  }

  return <AuthVersionContext.Provider value={authVersion}>{children}</AuthVersionContext.Provider>;
};

const App = () => (
  <AppProviders>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <SeoMetadata />
        <AuthBootstrap>
          <ScrollToTop />
          <PageBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              <Route element={<RequireAuth />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/module/:id" element={<ModuleDetail />} />
                <Route path="/module/:id/lesson/:lessonIndex" element={<LessonView />} />
                <Route path="/test/:id" element={<PracticeTestView />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </PageBoundary>
        </AuthBootstrap>
      </BrowserRouter>
    </MotionConfig>
  </AppProviders>
);

export default App;
