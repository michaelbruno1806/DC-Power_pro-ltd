import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, X, ArrowRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const links = [
  { label: "Home", to: "/" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
  { label: "Gallery", to: "/gallery" },
  { label: "Join Us", to: "/join-us" },
  { label: "Contact", to: "/contact" },
];

const MarketingNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border/60" : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-18 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span
            className="h-9 w-9 rounded-xl flex items-center justify-center font-display font-bold text-[13px] text-primary-foreground"
            style={{ background: "var(--gradient-emerald)", boxShadow: "var(--shadow-glow)" }}
          >
            DC
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            dc<span className="text-primary">payroll</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 rounded-full bg-secondary/40 border border-border/50 px-1.5 py-1.5">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "text-sm px-4 py-1.5 rounded-full transition-colors",
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/auth"
            className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
          >
            Sign in
          </Link>
          <button
            onClick={() => navigate("/auth")}
            className="text-sm font-medium rounded-full px-5 py-2.5 text-primary-foreground inline-flex items-center gap-1.5 transition-transform hover:scale-[1.03]"
            style={{ background: "var(--gradient-emerald)" }}
          >
            Start free trial <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="lg:hidden p-2 rounded-lg text-foreground hover:bg-secondary/60"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg border border-border/60 text-muted-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/auth"
              className="flex-1 text-center text-sm font-medium rounded-full px-5 py-2.5 text-primary-foreground"
              style={{ background: "var(--gradient-emerald)" }}
            >
              Start free trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default MarketingNav;
