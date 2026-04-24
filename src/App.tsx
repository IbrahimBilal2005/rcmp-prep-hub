import { Suspense, lazy, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { getAuthSession, initializeAuthSession, isAuthenticated, subscribeToAuthChanges } from "@/lib/auth";
import { AppProviders } from "@/providers/AppProviders";

const Index = lazy(() => import("./pages/Index.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const ModuleDetail = lazy(() => import("./pages/ModuleDetail.tsx"));
const LessonView = lazy(() => import("./pages/LessonView.tsx"));
const PracticeTestView = lazy(() => import("./pages/PracticeTestView.tsx"));
const Signup = lazy(() => import("./pages/Signup.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const RequireAuth = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/signup?mode=signup" replace />;
  }

  return <Outlet />;
};

const RequireAdmin = () => {
  const session = getAuthSession();

  if (!session) {
    return <Navigate to="/signup?mode=login" replace />;
  }

  if (session.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

const RouteFallback = () => <div className="min-h-screen bg-background" />;

const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [, setAuthVersion] = useState(0);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => undefined;

    void (async () => {
      await initializeAuthSession();

      if (!active) {
        return;
      }

      setReady(true);

      unsubscribe = subscribeToAuthChanges(() => {
        if (!active) {
          return;
        }

        setAuthVersion((current) => current + 1);
      });
    })();

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  return <>{children}</>;
};

const App = () => (
  <AppProviders>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthBootstrap>
          <ScrollToTop />
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
        </AuthBootstrap>
      </BrowserRouter>
    </MotionConfig>
  </AppProviders>
);

export default App;
