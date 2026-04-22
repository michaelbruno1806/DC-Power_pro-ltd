import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import logo from "@/assets/dc-payroll-logo.jpeg";

const currentYear = new Date().getFullYear();

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Subtle ambient backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>

      <AppSidebar />
      <main className="flex-1 overflow-auto relative flex flex-col">
        <div className="max-w-[1400px] w-full mx-auto px-8 py-10 animate-fade-in flex-1">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="border-t border-border/60 mt-12 bg-background/50">
          <div className="max-w-[1400px] mx-auto px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="DC Payroll"
                className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.25)]"
              />
              <div>
                <div className="font-display font-semibold text-foreground text-sm tracking-wide leading-tight">
                  DC Payroll
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                  Premium · Compliant
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-1.5">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                © {currentYear} DC Payroll · All rights reserved
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
                Powered by{" "}
                <a
                  href="#"
                  className="text-[#d4af37]/90 hover:text-[#d4af37] font-medium transition-colors"
                >
                  MB18 Solutions
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AppLayout;
