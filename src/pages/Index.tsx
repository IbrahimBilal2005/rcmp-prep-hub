import { Suspense, lazy } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";

const ModulesSection = lazy(() => import("@/components/landing/ModulesSection"));
const HowItWorksSection = lazy(() => import("@/components/landing/HowItWorksSection"));
const PricingSection = lazy(() => import("@/components/landing/PricingSection"));
const Footer = lazy(() => import("@/components/landing/Footer"));

const SectionFallback = () => <div className="h-24" />;

const Index = () => {
  return (
    <div className="app-canvas">
      <Navbar />
      <main>
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <ModulesSection />
          <HowItWorksSection />
          <PricingSection />
        </Suspense>
      </main>
      <Suspense fallback={<SectionFallback />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
