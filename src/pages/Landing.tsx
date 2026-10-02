import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Check, Shield, Users, BarChart3, Globe2, Clock, Activity,
  FileText, Bot, Fingerprint, Wallet, ChevronRight, BadgePercent,
} from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const stats = [
  { value: "100+", label: "Mauritian businesses" },
  { value: "10s", label: "Payroll processing*" },
  { value: "14 days", label: "Free to try" },
];

const features = [
  { icon: Wallet, title: "One-click payroll run", desc: "Salaries, PAYE, NPF, CSG, PRGF, allowances and overtime — calculated, validated and ready for the bank batch." },
  { icon: Bot, title: "Payroll assistant", desc: "A monthly checklist that tells you exactly what's missing before you finalise a run." },
  { icon: Fingerprint, title: "Attendance & clocking", desc: "Working-day configs, public holidays and unpaid leave feed straight into the calculation engine." },
  { icon: FileText, title: "Payslips & MRA filings", desc: "Branded PDF payslips, Excel reports and MRA-format CSV returns with the correct filing deadline." },
  { icon: Users, title: "Employees & leaves", desc: "Full employee records, documents, leave balances, December payouts and January resets." },
  { icon: Shield, title: "Roles & isolation", desc: "Super admin, company owner, payroll officer, HR and accountant — each with strict data isolation." },
];

const steps = [
  { n: "01", title: "Set up your company", desc: "BRN, TAN, MRA employer reference and payroll cycle in a guided 3-step wizard." },
  { n: "02", title: "Add your team", desc: "Add staff manually or import your whole payroll with the Excel template." },
  { n: "03", title: "Run payday", desc: "Review the draft, finalise, download payslips and export your MRA returns." },
];

const plans = [
  { name: "Basic", monthly: 1500, desc: "Up to 10 employees", features: ["Payroll calculation", "PDF payslips", "Basic reports", "Email support"], popular: false },
  { name: "Pro", monthly: 3500, desc: "Up to 50 employees", features: ["Everything in Basic", "MRA filing exports", "Leave management", "Multi-user access", "Priority support"], popular: true },
  { name: "Enterprise", monthly: null, desc: "Unlimited employees", features: ["Everything in Pro", "Accountant mode", "Custom integrations", "Dedicated manager", "SLA guarantee"], popular: false },
];

const faqs = [
  { q: "Is DC Payroll compliant with Mauritian regulations?", a: "Yes. PAYE, CSG/NSF (capped), PRGF and the training levy are pre-configured, and filing deadlines follow the month after your payroll period." },
  { q: "Can my accountant manage several companies?", a: "Yes. Accountant mode lets one login switch between every company that has invited them, with view or manage rights." },
  { q: "What happens after the free trial?", a: "Your workspace becomes read-only until you pick a plan. Nothing is deleted." },
];

const Landing = () => {
  const navigate = useNavigate();
  const { user, company } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [selectedPlan, setSelectedPlan] = useState("Pro");

  const payrollPath = company?.setup_completed ? "/payroll" : "/onboarding";
  const primaryPath = user ? payrollPath : "/auth";
  const primaryLabel = user ? "Open payroll" : "Start free trial";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      {/* Hero */}
      <section className="cyber-hero relative overflow-hidden px-3 pb-6 pt-24 sm:px-6 sm:pb-10 sm:pt-28 lg:min-h-[760px] lg:pt-28">
        <div className="cyber-grid absolute inset-0 pointer-events-none" />
        <div className="cyber-contours cyber-contours-one" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="cyber-contours cyber-contours-two" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-14 rounded-3xl border border-border/70 bg-panel-2/80 px-6 py-16 shadow-[var(--shadow-elevated)] sm:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-14 lg:py-20">
          <div className="relative z-10 animate-fade-up">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1.5">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Mauritius payroll system · Online</span>
            </div>
            <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[0.98] text-foreground sm:text-6xl lg:text-7xl">
              Payroll operations,
              <br />
              <span className="text-gradient">under control.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Attendance, salaries, leaves, statutory filings and payslips — connected in one secure workflow built for Mauritius.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button onClick={() => navigate(primaryPath)} size="lg" className="h-12 rounded-xl px-7 font-semibold shadow-[var(--shadow-glow)]">
                {primaryLabel} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button onClick={() => navigate("/pricing")} variant="outline" size="lg" className="h-12 rounded-xl border-border/80 bg-secondary/40 px-7">
                View pricing
              </Button>
            </div>
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-border/60 pt-7">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-xl font-bold text-foreground sm:text-2xl">{s.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground sm:text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 animate-fade-in lg:pl-4">
            <div className="absolute -inset-4 rounded-3xl bg-primary/[0.08] blur-3xl" />
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(primaryPath)}
              className="cyber-console group relative h-auto w-full whitespace-normal overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-5 text-left shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-1 hover:bg-card/90 sm:p-7"
              aria-label={user ? "Open payroll workspace" : "Start free trial and create a payroll workspace"}
            >
              <div className="mb-7 flex items-center justify-between border-b border-border/60 pb-4">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"><Activity className="h-3.5 w-3.5 text-primary" /> Payroll control</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Cycle active</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Payroll · October 2026</div>
                  <div className="mt-1 font-display text-3xl font-bold text-foreground">Rs 1,240,000</div>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Draft
                </span>
              </div>
              <div className="mt-7 flex h-28 items-end gap-2 border-b border-border/50 px-1">
                {[42, 68, 54, 82, 64, 94, 76, 88].map((height, index) => (
                  <span key={height + index} className={`w-full rounded-t-sm transition-all duration-700 ${index === 5 ? "bg-primary" : "bg-secondary group-hover:bg-primary/30"}`} style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <span>Gross payroll</span><span>Validated 94%</span>
              </div>
              <div className="mt-6 space-y-2.5">
                {[
                  { label: "Employee records", meta: "Complete" },
                  { label: "PAYE · CSG · PRGF", meta: "Calculated" },
                  { label: "Payslips & MRA returns", meta: "Ready" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/40 px-4 py-3">
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/25 bg-primary/10">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </span>
                      {row.label}
                    </div>
                    <span className="hidden text-xs text-primary sm:inline">{row.meta}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <span>Company → Employees → Payroll → Filing</span>
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
              </div>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="eyebrow mb-3">What's inside</div>
            <h2 className="font-display text-3xl sm:text-5xl text-foreground">Everything HR needs.</h2>
            <p className="text-muted-foreground mt-4">
              One platform, every payroll job. Built for the way Mauritian businesses actually work.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {features.map((f) => (
              <div key={f.title} className="premium-card cyber-card p-6 hover:-translate-y-1 transition-all duration-300">
                <div className="h-11 w-11 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center mb-5">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-5 sm:px-8 bg-secondary/25 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="eyebrow mb-3">How it works</div>
          <h2 className="font-display text-3xl sm:text-5xl text-foreground max-w-xl">Live in an afternoon.</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {steps.map((s) => (
              <div key={s.n} className="cyber-card rounded-lg border border-border/60 bg-card/60 p-7">
                <div className="font-display text-xs font-bold tracking-[0.2em] text-primary">STEP {s.n}</div>
                <h3 className="font-display text-xl font-semibold text-foreground mt-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance strip */}
      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="eyebrow mb-3">Mauritius compliance</div>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground">
              Statutory rates, already configured.
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              PAYE, CSG/NSF, PRGF and the training levy are calculated on every run, and your MRA filing
              deadline is always the end of the month following the payroll period.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {["PAYE", "CSG / NSF", "PRGF", "Training levy", "MRA CSV", "Bank batch"].map((t) => (
                <span key={t} className="text-xs rounded-full border border-primary/25 bg-primary/10 text-primary px-3 py-1.5">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: BarChart3, k: "Auto-calculated", v: "Every deduction" },
              { icon: Globe2, k: "MUR ready", v: "Multi-currency" },
              { icon: Clock, k: "Deadlines", v: "Tracked monthly" },
              { icon: Shield, k: "Audit logs", v: "Who did what" },
            ].map((c) => (
              <div key={c.k} className="premium-card p-6">
                <c.icon className="h-5 w-5 text-primary" />
                <div className="font-display text-lg font-semibold text-foreground mt-4">{c.k}</div>
                <div className="text-sm text-muted-foreground">{c.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-5 sm:px-8 bg-secondary/25 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto">
            <div className="eyebrow mb-3">Pricing</div>
            <h2 className="font-display text-3xl sm:text-5xl text-foreground">Simple, transparent pricing.</h2>
            <p className="text-muted-foreground mt-4">Start free for 14 days. No credit card required.</p>
            <div className="mt-8 inline-flex items-center rounded-full border border-border/60 bg-card/70 p-1">
              {(["monthly", "annual"] as const).map((b) => (
                <Button
                  variant="ghost"
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`rounded-full px-5 h-9 text-sm font-semibold transition-all capitalize ${billing === b ? "text-primary-foreground hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  style={billing === b ? { background: "var(--gradient-emerald)" } : undefined}
                >
                  {b}
                  {b === "annual" && (
                    <span className={`ml-2 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${billing === "annual" ? "bg-white/20 text-primary-foreground" : "bg-primary/15 text-primary"}`}>
                      2 months free
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {plans.map((p) => {
              const isSelected = selectedPlan === p.name;
              return (
              <div
                key={p.name}
                onClick={() => setSelectedPlan(p.name)}
                className={`rounded-2xl p-8 border bg-card/70 relative cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/40 shadow-[var(--shadow-glow)] -translate-y-1"
                    : p.popular
                      ? "border-primary/50 ring-1 ring-primary/25"
                      : "border-border/60 hover:border-primary/30"
                }`}
              >
                {(isSelected || p.popular) && (
                  <span className="absolute -top-3 left-8 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-full px-3 py-1 text-primary-foreground" style={{ background: "var(--gradient-emerald)" }}>
                    {isSelected ? "Selected plan" : "Most popular"}
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold text-foreground">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {p.monthly
                      ? `Rs ${(billing === "monthly" ? p.monthly : Math.round((p.monthly * 10) / 12)).toLocaleString("en-US")}`
                      : "Custom"}
                  </span>
                  {p.monthly && <span className="text-sm text-muted-foreground">/month</span>}
                </div>
                {p.monthly && billing === "annual" && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground line-through">Rs {(p.monthly * 12).toLocaleString("en-US")}/yr</span>
                    <span className="text-foreground font-medium">Rs {(p.monthly * 10).toLocaleString("en-US")}/yr</span>
                    <span className="inline-flex items-center gap-1 text-primary">
                      <BadgePercent className="h-3.5 w-3.5" /> Save Rs {(p.monthly * 2).toLocaleString("en-US")}
                    </span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-2">{p.desc}</p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(p.name);
                    navigate(p.name === "Enterprise" ? "/contact" : primaryPath);
                  }}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full mt-8 rounded-full h-11 text-sm font-semibold transition-colors ${isSelected ? "text-primary-foreground" : "border-border/60"}`}
                  style={isSelected ? { background: "var(--gradient-emerald)" } : undefined}
                >
                  {p.name === "Enterprise" ? "Contact sales" : isSelected ? primaryLabel : `Choose ${p.name}`}
                </Button>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-5 sm:px-8 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="eyebrow mb-3">FAQ</div>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground">Questions, answered.</h2>
          <div className="mt-10 divide-y divide-border/60">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <h3 className="font-display text-lg font-semibold text-foreground">{f.q}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl border border-primary/25 bg-hero p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[320px] rounded-full bg-primary/15 blur-[120px]" />
          <div className="relative">
            <p className="font-script text-3xl text-primary">Ready when you are —</p>
            <h2 className="font-display text-3xl sm:text-5xl text-foreground mt-1">Run your next payroll here.</h2>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Button
                onClick={() => navigate(primaryPath)}
                size="lg"
                className="rounded-full px-7 h-12 text-sm font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-emerald)", boxShadow: "var(--shadow-glow)" }}
              >
                {primaryLabel} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate("/contact")}
                variant="outline"
                size="lg"
                className="rounded-full px-7 h-12 text-sm font-semibold bg-secondary/70 border-border/60"
              >
                Talk to sales <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};

export default Landing;
