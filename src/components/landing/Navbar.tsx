import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, MoveRight, X } from "lucide-react";
import BrandLockup from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-4 z-50 px-4 sm:top-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[4.75rem] max-w-[88rem] items-center justify-between rounded-full border border-[rgba(214,224,240,0.7)] bg-[linear-gradient(180deg,rgba(24,40,74,0.42),rgba(34,50,86,0.28))] px-4 shadow-[0_24px_80px_-42px_rgba(10,18,38,0.48),inset_0_1px_0_rgba(240,246,255,0.24)] backdrop-blur-2xl sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <BrandLockup
            size="sm"
            subtitle="RCMP Prep"
            textClassName="text-[hsl(0_0%_98%)]"
            subtitleClassName="text-[rgba(226,235,248,0.72)]"
            logoShell="solid"
          />
        </Link>

        <div className="hidden items-center gap-3 lg:flex">
          <a href="#modules" className="rounded-full px-4 py-2 text-sm text-[rgba(226,235,248,0.82)] transition-colors hover:bg-white/10 hover:text-white">Modules</a>
          <a href="#pricing" className="rounded-full px-4 py-2 text-sm text-[rgba(226,235,248,0.82)] transition-colors hover:bg-white/10 hover:text-white">Pricing</a>
          <a href="#how-it-works" className="rounded-full px-4 py-2 text-sm text-[rgba(226,235,248,0.82)] transition-colors hover:bg-white/10 hover:text-white">How It Works</a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/signup?mode=login">
            <Button variant="ghost" className="h-11 px-5">
              Login
            </Button>
          </Link>
          <Link to="/signup?mode=signup">
            <Button variant="hero" size="sm">
              Create Account
              <MoveRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <button className="rounded-full border border-white/70 bg-white/55 p-3 text-foreground backdrop-blur-xl md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mx-auto mt-3 max-w-[88rem] space-y-3 rounded-[2rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(247,243,238,0.7))] px-5 py-5 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl md:hidden">
          <a href="#modules" className="block rounded-2xl px-3 py-3 text-sm text-muted-foreground hover:bg-white/50 hover:text-foreground" onClick={() => setMobileOpen(false)}>Modules</a>
          <a href="#pricing" className="block rounded-2xl px-3 py-3 text-sm text-muted-foreground hover:bg-white/50 hover:text-foreground" onClick={() => setMobileOpen(false)}>Pricing</a>
          <a href="#how-it-works" className="block rounded-2xl px-3 py-3 text-sm text-muted-foreground hover:bg-white/50 hover:text-foreground" onClick={() => setMobileOpen(false)}>How It Works</a>
          <Link to="/signup?mode=login" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full justify-center">Login</Button>
          </Link>
          <Link to="/signup?mode=signup" onClick={() => setMobileOpen(false)}>
            <Button variant="hero" className="mt-2 w-full justify-center">
              Create Account
              <MoveRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
