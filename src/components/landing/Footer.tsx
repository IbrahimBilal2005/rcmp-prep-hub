import BrandLockup from "@/components/brand/BrandLockup";

const Footer = () => {
  return (
    <footer className="pt-8 pb-10">
      <div className="app-shell">
        <div className="panel-inverse rounded-[2.2rem] px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <BrandLockup size="sm" subtitle="RCMP Prep" />
              <p className="mt-4 max-w-md text-sm leading-7 text-primary-foreground/62">
                Structured RCMP-style preparation with guided modules, timed practice, and review tools built for consistent improvement.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-primary-foreground/50">
              <a href="#modules" className="transition-colors hover:text-primary-foreground">Modules</a>
              <a href="#pricing" className="transition-colors hover:text-primary-foreground">Pricing</a>
              <a href="#how-it-works" className="transition-colors hover:text-primary-foreground">How It Works</a>
            </div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/30">
              Copyright {new Date().getFullYear()} AptitudeForge. All rights reserved.
            </p>
          </div>
          <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs uppercase tracking-[0.18em] text-primary-foreground/22">
            AptitudeForge is an independent training platform and is not affiliated with the RCMP.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
