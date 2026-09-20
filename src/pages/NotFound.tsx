import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, LifeBuoy, LayoutDashboard } from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MarketingNav />

      <main className="flex-1 flex items-center justify-center px-5 py-32 bg-hero">
        <div className="max-w-xl text-center">
          <div className="font-display text-[88px] leading-none font-bold text-primary/25">404</div>
          <h1 className="font-display text-3xl font-bold text-foreground mt-2 tracking-tight">
            This page doesn’t exist
          </h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            The link may be out of date. Here’s where you probably wanted to go.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium rounded-full px-5 py-2.5 text-primary-foreground"
              style={{ background: "var(--gradient-emerald)" }}
            >
              <Home className="h-4 w-4" /> Home
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium rounded-full px-5 py-2.5 border border-border/70 text-foreground hover:bg-secondary/50 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-sm font-medium rounded-full px-5 py-2.5 border border-border/70 text-foreground hover:bg-secondary/50 transition-colors"
            >
              <LifeBuoy className="h-4 w-4" /> Get help
            </Link>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
};

export default NotFound;
