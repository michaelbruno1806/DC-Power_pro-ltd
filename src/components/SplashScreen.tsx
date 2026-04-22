import { useEffect, useState } from "react";
import logo from "@/assets/dc-payroll-logo.png";

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

/**
 * Cinematic intro for DC Payroll.
 * Black stage → spotlight pulse → logo zooms in with mask reveal →
 * gold + silver shimmer beams sweep across → curtain wipe out.
 */
const SplashScreen = ({ onFinish, duration = 3200 }: SplashScreenProps) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), duration - 700);
    const finishTimer = setTimeout(() => onFinish?.(), duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black overflow-hidden transition-opacity duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
        exiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Layer 1 — Deep vignette stage */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(20,20,20,1)_0%,_#000_70%)]" />

      {/* Layer 2 — Soft gold spotlight pulsing in */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 35%, transparent 70%)",
          animation: "splash-spotlight 2.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      />

      {/* Layer 3 — Subtle dot grid, drifting */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d4af37 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          animation: "splash-drift 6s linear infinite",
        }}
      />

      {/* Layer 4 — Diagonal shimmer beams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 -left-1/2 w-[60%] h-full"
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(212,175,55,0.18) 48%, rgba(255,235,180,0.35) 50%, rgba(192,192,192,0.18) 52%, transparent 70%)",
            transform: "skewX(-12deg)",
            animation: "splash-beam 2.6s cubic-bezier(0.65,0,0.35,1) 0.7s forwards",
          }}
        />
        <div
          className="absolute top-0 -left-1/2 w-[40%] h-full opacity-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(192,192,192,0.25) 50%, transparent 70%)",
            transform: "skewX(-12deg)",
            animation: "splash-beam 2.2s cubic-bezier(0.65,0,0.35,1) 1.2s forwards",
          }}
        />
      </div>

      {/* Layer 5 — Logo stage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex flex-col items-center gap-10">
          {/* Concentric rings */}
          <div className="absolute -inset-16 pointer-events-none">
            <div
              className="absolute inset-0 rounded-full border border-[#d4af37]/15"
              style={{ animation: "splash-ring 3s cubic-bezier(0.22, 1, 0.36, 1) both" }}
            />
            <div
              className="absolute -inset-8 rounded-full border border-[#c0c0c0]/10"
              style={{ animation: "splash-ring 3.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both" }}
            />
            <div
              className="absolute -inset-16 rounded-full border border-[#d4af37]/5"
              style={{ animation: "splash-ring 3.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both" }}
            />
          </div>

          {/* Logo with mask reveal */}
          <div
            className="relative"
            style={{ animation: "splash-logo-in 1.6s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            <img
              src={logo}
              alt="DC Payroll"
              className="relative w-72 md:w-80 h-auto select-none"
              style={{
                filter:
                  "drop-shadow(0 0 30px rgba(212,175,55,0.45)) drop-shadow(0 0 60px rgba(212,175,55,0.2))",
                animation: "splash-logo-shimmer 3s ease-in-out 1s infinite",
              }}
              draggable={false}
            />
            {/* Reveal mask wiping down */}
            <div
              className="absolute inset-0 bg-black"
              style={{ animation: "splash-mask-wipe 1.4s cubic-bezier(0.83, 0, 0.17, 1) 0.2s both" }}
            />
          </div>

          {/* Tagline */}
          <div
            className="flex flex-col items-center gap-4"
            style={{ animation: "splash-fade-rise 1s cubic-bezier(0.22,1,0.36,1) 1.3s both" }}
          >
            <div className="flex items-center gap-4">
              <span className="h-px w-14 bg-gradient-to-r from-transparent via-[#d4af37] to-[#d4af37]" />
              <span className="text-[10px] uppercase tracking-[0.5em] text-[#d4af37]/85 font-medium font-display">
                Premium · Compliant
              </span>
              <span className="h-px w-14 bg-gradient-to-l from-transparent via-[#c0c0c0] to-[#c0c0c0]" />
            </div>
            {/* Loading bar */}
            <div className="mt-1 h-[2px] w-48 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#d4af37] via-[#f0d97a] to-[#c0c0c0]"
                style={{
                  animation: "splash-bar 2.2s cubic-bezier(0.65,0,0.35,1) 0.8s both",
                  transformOrigin: "left",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Layer 6 — Powered by */}
      <div
        className="absolute bottom-10 left-0 right-0 text-center"
        style={{ animation: "splash-fade-rise 1s cubic-bezier(0.22,1,0.36,1) 1.6s both" }}
      >
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
          Powered by{" "}
          <span className="text-[#d4af37]/85 font-medium">MB18 Solutions</span>
        </p>
      </div>

      {/* Layer 7 — Curtain wipe out */}
      {exiting && (
        <>
          <div
            className="absolute inset-0 bg-black"
            style={{ animation: "splash-curtain-top 0.7s cubic-bezier(0.83, 0, 0.17, 1) forwards" }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ animation: "splash-curtain-bottom 0.7s cubic-bezier(0.83, 0, 0.17, 1) forwards" }}
          />
        </>
      )}
    </div>
  );
};

export default SplashScreen;
