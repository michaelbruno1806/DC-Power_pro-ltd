import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

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
        <footer className="border-t border-border/60 mt-12">
          <div className="max-w-[1400px] mx-auto px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center font-display font-semibold text-sm text-primary-foreground shrink-0"
                style={{ background: "var(--gradient-emerald)", boxShadow: "var(--shadow-glow)" }}
              >
                DC
              </div>
              <div>
                <div className="font-display font-semibold text-foreground text-sm tracking-wide leading-tight">
                  DC Payroll
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                  Premium · Compliant
                </div>
              </div>
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              © {currentYear} DC Payroll · All rights reserved
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AppLayout;
