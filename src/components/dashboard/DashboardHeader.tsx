import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";

const DashboardHeader = () => (
  <header className="bg-navy border-b border-navy-light/30 sticky top-0 z-50">
    <div className="container mx-auto px-4 flex items-center justify-between h-16">
      <Link to="/" className="flex items-center gap-2">
        <Shield className="h-7 w-7 text-accent" />
        <span className="font-heading text-lg font-bold text-primary-foreground">AptitudeForge</span>
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-primary-foreground/50 hidden sm:block">Welcome back</span>
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-primary-foreground/50 hover:text-primary-foreground hover:bg-navy-light">
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </Link>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
