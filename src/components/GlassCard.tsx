import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  glow?: boolean;
}

const GlassCard = ({ children, className, elevated = false, glow = false }: GlassCardProps) => (
  <div
    className={cn(
      "premium-card p-6 transition-all duration-400 ease-elegant",
      elevated && "shadow-[var(--shadow-card)]",
      glow && "animate-glow-pulse",
      className
    )}
  >
    {children}
  </div>
);

export default GlassCard;
