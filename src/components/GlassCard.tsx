import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  glow?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, elevated = false, glow = false, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "premium-card p-6 transition-all duration-400 ease-elegant",
        elevated && "shadow-[var(--shadow-card)]",
        glow && "animate-glow-pulse",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  ),
);
GlassCard.displayName = "GlassCard";

export default GlassCard;
