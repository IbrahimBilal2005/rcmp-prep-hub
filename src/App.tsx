import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import { AppProviders } from "@/providers/AppProviders";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ModuleDetail from "./pages/ModuleDetail.tsx";
import LessonView from "./pages/LessonView.tsx";
import PracticeTestView from "./pages/PracticeTestView.tsx";
import Signup from "./pages/Signup.tsx";
import NotFound from "./pages/NotFound.tsx";

const RequireAuth = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/signup?mode=signup" replace />;
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

const App = () => (
  <AppProviders>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/module/:id" element={<ModuleDetail />} />
          <Route path="/module/:id/lesson/:lessonIndex" element={<LessonView />} />
          <Route path="/test/:id" element={<PracticeTestView />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AppProviders>
);

export default App;
