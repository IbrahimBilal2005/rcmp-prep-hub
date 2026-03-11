import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-navy py-12 border-t border-navy-light/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent" />
            <span className="font-heading font-bold text-primary-foreground">AptitudeForge</span>
          </div>
          <div className="flex gap-6 text-sm text-primary-foreground/50">
            <a href="#modules" className="hover:text-primary-foreground transition-colors">Modules</a>
            <a href="#pricing" className="hover:text-primary-foreground transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-primary-foreground transition-colors">How It Works</a>
          </div>
          <p className="text-xs text-primary-foreground/30">
            © {new Date().getFullYear()} AptitudeForge. All rights reserved.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/20 text-center mt-8">
          AptitudeForge is an independent training platform and is not affiliated with the RCMP.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
