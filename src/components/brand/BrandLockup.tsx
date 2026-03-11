import logo from "@/assets/logo-mark.png";
import { cn } from "@/lib/utils";

interface BrandLockupProps {
  className?: string;
  subtitle?: string;
  textClassName?: string;
  subtitleClassName?: string;
  size?: "sm" | "md";
}

const BrandLockup = ({
  className,
  subtitle,
  textClassName,
  subtitleClassName,
  size = "md",
}: BrandLockupProps) => {
  const logoSize = size === "sm" ? "h-10 w-10" : "h-12 w-12";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="rounded-[1.35rem] border border-white/70 bg-white/60 p-1.5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] ring-1 ring-white/40 backdrop-blur-xl">
        <img src={logo} alt="AptitudeForge logo" className={cn("object-contain", logoSize)} />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "font-heading font-semibold tracking-[0.16em] uppercase text-foreground",
            size === "sm" ? "text-base" : "text-lg",
            textClassName,
          )}
        >
          AptitudeForge
        </p>
        {subtitle && (
          <p className={cn("text-[11px] uppercase tracking-[0.28em] text-muted-foreground", subtitleClassName)}>{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default BrandLockup;
