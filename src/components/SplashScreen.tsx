import { useEffect, useState } from "react";
import logo from "@/assets/dc-payroll-logo.png";

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

const SplashScreen = ({ onFinish, duration = 3600 }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const enterT = setTimeout(() => setPhase("hold"), 400);
    const exitT = setTimeout(() => setPhase("exit"), duration - 800);
    const finishT = setTimeout(() => onFinish?.(), duration);
    return () => { clearTimeout(enterT); clearTimeout(exitT); clearTimeout(finishT); };
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-700 ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "linear-gradient(145deg, #000 0%, #0a0a0a 40%, #050d05 100%)" }}
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(142,76%,45%,0.08) 0%, transparent 60%)",
            animation: "splash-orb-pulse 4s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(142,76%,45%,0.05) 0%, transparent 60%)",
            animation: "splash-orb-pulse 5s ease-in-out 0.5s infinite",
          }}
        />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(142,76%,45%) 1px, transparent 1px), linear-gradient(90deg, hsl(142,76%,45%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Logo with glow */}
        <div
          className="relative"
          style={{ animation: "splash-logo-enter 1.2s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {/* Glow behind logo */}
          <div
            className="absolute inset-0 -m-8 rounded-full blur-[60px]"
            style={{
              background: "radial-gradient(circle, hsl(142,76%,45%,0.2) 0%, transparent 70%)",
              animation: "splash-glow-breathe 3s ease-in-out infinite",
            }}
          />
          <img
            src={logo}
            alt="DC Payroll"
            className="relative w-56 md:w-64 h-auto select-none"
            style={{
              filter: "drop-shadow(0 0 40px hsl(142,76%,45%,0.3))",
            }}
            draggable={false}
          />
        </div>

        {/* Tagline */}
        <div
          className="flex flex-col items-center gap-3"
          style={{ animation: "splash-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s both" }}
        >
          <div className="flex items-center gap-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-primary/60" />
            <span className="text-[10px] uppercase tracking-[0.45em] text-primary/80 font-medium">
              Premium Payroll Platform
            </span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-primary/60" />
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="w-48 h-[2px] bg-white/[0.06] rounded-full overflow-hidden"
          style={{ animation: "splash-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.9s both" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, hsl(142,76%,45%), hsl(142,70%,55%), hsl(142,76%,45%))",
              animation: "splash-progress 2.4s cubic-bezier(0.4,0,0.2,1) 0.6s both",
              transformOrigin: "left",
            }}
          />
        </div>
      </div>

      {/* Powered by */}
      <div
        className="absolute bottom-8 left-0 right-0 text-center"
        style={{ animation: "splash-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 1.2s both" }}
      >
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
          Powered by{" "}
          <span className="text-primary/70 font-medium">MB18 Solutions</span>
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
