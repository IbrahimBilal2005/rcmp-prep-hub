import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-md border-b border-navy-light/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-accent" />
          <span className="font-heading text-xl font-bold text-primary-foreground">
            AptitudeForge
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#modules" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Modules</a>
          <a href="#pricing" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Pricing</a>
          <a href="#how-it-works" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">How It Works</a>
          <Link to="/dashboard">
            <Button variant="ghost" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-navy-light">
              Login
            </Button>
          </Link>
          <a href="#pricing">
            <Button variant="hero" size="sm">Get Started</Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy border-t border-navy-light/50 px-4 py-4 space-y-3">
          <a href="#modules" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground py-2" onClick={() => setMobileOpen(false)}>Modules</a>
          <a href="#pricing" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground py-2" onClick={() => setMobileOpen(false)}>Pricing</a>
          <a href="#how-it-works" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground py-2" onClick={() => setMobileOpen(false)}>How It Works</a>
          <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-navy-light">Login</Button>
          </Link>
          <a href="#pricing" onClick={() => setMobileOpen(false)}>
            <Button variant="hero" className="w-full mt-2">Get Started</Button>
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
