import { Link } from "react-router-dom";
import { Mail, MessageCircle, MapPin } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/#features" },
      { label: "Pricing", to: "/pricing" },
      { label: "Gallery", to: "/gallery" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Join Us", to: "/join-us" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", to: "/auth" },
      { label: "Start free trial", to: "/auth" },
      { label: "Employee portal", to: "/my-portal" },
    ],
  },
];

const MarketingFooter = () => (
  <footer className="border-t border-border/60 bg-panel-2/60">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
      <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="h-9 w-9 rounded-xl flex items-center justify-center font-display font-bold text-[13px] text-primary-foreground"
              style={{ background: "var(--gradient-emerald)" }}
            >
              DC
            </span>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              dc<span className="text-primary">payroll</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-4 max-w-xs leading-relaxed">
            Built in Mauritius. Attendance, salaries, leaves and MRA filings — every payroll, the same way,
            every month.
          </p>
          <div className="mt-5 space-y-2 text-sm text-muted-foreground">
            <a href="https://wa.me/23057181234" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <MessageCircle className="h-4 w-4 text-primary" /> +230 5718 1234
            </a>
            <a href="mailto:hello@dcpayroll.mu" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Mail className="h-4 w-4 text-primary" /> hello@dcpayroll.mu
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Port Louis, Mauritius
            </span>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <div className="text-[11px] uppercase tracking-[0.2em] text-foreground/70 font-semibold mb-4">
              {col.title}
            </div>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} DC Payroll · All rights reserved
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
          Powered by <span className="text-primary font-medium">MB18 Solutions</span>
        </div>
      </div>
    </div>
  </footer>
);

export default MarketingFooter;
