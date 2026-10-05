import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, X, ArrowRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Home", to: "/" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
];

const MarketingNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, company } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const workspacePath = company?.setup_completed ? "/payroll" : "/onboarding";
  const actionPath = user ? workspacePath : "/auth?mode=signup";
  const actionLabel = user ? "Open payroll" : "Start free trial";

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        "editorial-nav",
        scrolled && "shadow-sm",
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span
            className="h-9 w-9 rounded-lg flex items-center justify-center font-display font-bold text-[13px] text-primary-foreground transition-transform hover:scale-105"
            style={{ background: "hsl(var(--primary))" }}
          >
            DC
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            dc<span className="text-primary">payroll</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-xs font-medium uppercase tracking-[0.12em] transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-full text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
          <Button
            onClick={() => navigate(actionPath)}
            className="landing-action h-10 rounded-sm px-5 text-sm font-semibold"
          >
            {actionLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className="lg:hidden rounded-lg text-foreground"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl px-5 py-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm",
                pathname === l.to ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg text-muted-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link
              to={actionPath}
              className="landing-action flex-1 text-center text-sm font-medium rounded-sm px-5 py-2.5"
            >
              {actionLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default MarketingNav;
