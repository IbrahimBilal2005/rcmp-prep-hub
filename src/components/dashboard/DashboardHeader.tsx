import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Crown, LogOut } from "lucide-react";
import BrandLockup from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/button";
import { isFreePreviewMode } from "@/lib/access";
import { clearAuthSession } from "@/lib/auth";

const DashboardHeader = () => {
  const freePreview = isFreePreviewMode();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="app-shell flex h-16 items-center justify-between gap-2 sm:gap-4">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <BrandLockup size="sm" subtitle="Training Hub" textWrapperClassName="hidden min-[400px]:block" textClassName="text-foreground" />
        </Link>
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {freePreview && (
            <>
              <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground md:inline-flex">
                <Crown className="h-3.5 w-3.5 text-accent" />
                Free Preview
              </span>
              <Link to="/signup?step=plan">
                <Button variant="hero" size="sm">
                  Upgrade
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-label="Log out"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              void clearAuthSession().catch(console.error);
              navigate("/", { replace: true });
            }}
          >
            <LogOut className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
