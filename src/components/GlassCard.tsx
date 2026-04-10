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
      "rounded-2xl p-5",
      elevated ? "glass-elevated" : "glass-card",
      glow && "animate-glow-pulse",
      className
    )}
  >
    {children}
  </div>
);

export default GlassCard;
