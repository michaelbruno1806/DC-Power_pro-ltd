import { useEffect, useState } from "react";
import logo from "@/assets/dc-payroll-logo.jpeg";

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

const SplashScreen = ({ onFinish, duration = 2400 }: SplashScreenProps) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), duration - 600);
    const finishTimer = setTimeout(() => onFinish?.(), duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-700 ease-out ${
        exiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Ambient gold glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#d4af37]/10 blur-[140px] animate-splash-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#c0c0c0]/5 blur-[100px] animate-splash-glow" />
      </div>

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d4af37 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-8 animate-splash-rise">
        <div className="relative">
          {/* Rotating shimmer ring */}
          <div className="absolute -inset-8 rounded-full border border-[#d4af37]/20 animate-splash-spin" />
          <div className="absolute -inset-12 rounded-full border border-[#c0c0c0]/10 animate-splash-spin-reverse" />
          <img
            src={logo}
            alt="DC Payroll"
            className="relative w-64 h-auto drop-shadow-[0_0_40px_rgba(212,175,55,0.35)] animate-splash-fade"
          />
        </div>

        {/* Tagline */}
        <div className="flex flex-col items-center gap-3 animate-splash-fade-delayed">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#d4af37]" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37]/80 font-medium">
              Premium · Compliant
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#c0c0c0]" />
          </div>
          {/* Loading bar */}
          <div className="mt-2 h-[2px] w-40 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-[#d4af37] via-[#f0d97a] to-[#c0c0c0] animate-splash-bar" />
          </div>
        </div>
      </div>

      {/* Powered by */}
      <div className="absolute bottom-8 left-0 right-0 text-center animate-splash-fade-delayed">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
          Powered by <span className="text-[#d4af37]/80 font-medium">MB18 Solutions</span>
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
