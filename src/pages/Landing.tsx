import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Check, Star, Shield, Users, BarChart3, Globe2, Clock,
  FileText, Bot, Fingerprint, Wallet, ChevronRight,
} from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const stats = [
  { value: "100+", label: "Mauritian businesses" },
  { value: "10s", label: "Payroll processing*" },
  { value: "14 days", label: "Free to try" },
];

const clients = ["Sezwan Technologies", "Candy Palace", "Applied Nutrition", "Horus Group", "Island Exports", "Créole Services"];

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
  { name: "Basic", price: "Rs 1,500", period: "/month", desc: "Up to 10 employees", features: ["Payroll calculation", "PDF payslips", "Basic reports", "Email support"], popular: false },
  { name: "Pro", price: "Rs 3,500", period: "/month", desc: "Up to 50 employees", features: ["Everything in Basic", "MRA filing exports", "Leave management", "Multi-user access", "Priority support"], popular: true },
  { name: "Enterprise", price: "Custom", period: "", desc: "Unlimited employees", features: ["Everything in Pro", "Accountant mode", "Custom integrations", "Dedicated manager", "SLA guarantee"], popular: false },
];

const testimonials = [
  { name: "Ravi Doorgakant", role: "CFO, TechMauritius Ltd", text: "What took two days now takes thirty minutes. The MRA exports are exactly what our accountant asked for." },
  { name: "Anisha Doorgakant", role: "HR Manager, Island Exports", text: "Leaves, holidays and working days all flow into payroll. No more spreadsheets at month end." },
  { name: "Jean-Pierre L.", role: "Director, Créole Services", text: "Clean, fast and built for Mauritius. Onboarding our 60 staff took one afternoon." },
];

const faqs = [
  { q: "Is DC Payroll compliant with Mauritian regulations?", a: "Yes. PAYE, CSG/NSF (capped), PRGF and the training levy are pre-configured, and filing deadlines follow the month after your payroll period." },
  { q: "Can my accountant manage several companies?", a: "Yes. Accountant mode lets one login switch between every company that has invited them, with view or manage rights." },
  { q: "What happens after the free trial?", a: "Your workspace becomes read-only until you pick a plan. Nothing is deleted." },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-1/4 w-[640px] h-[640px] rounded-full bg-primary/[0.10] blur-[160px]" />
          <div className="absolute -bottom-24 left-0 w-[420px] h-[420px] rounded-full bg-primary/[0.07] blur-[130px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="animate-fade-up">
            <p className="font-script text-3xl sm:text-4xl text-primary mb-1">Built in Mauritius —</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-foreground">
              Payday,
              <br />
              <span className="text-primary">on autopilot.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mt-6 max-w-xl leading-relaxed">
              Attendance, salaries, leaves, statutory filings and payslips. DC Payroll runs every payroll the
              same way, every month.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-9">
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 rounded-full px-7 h-12 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
                style={{ background: "var(--gradient-emerald)", boxShadow: "var(--shadow-glow)" }}
              >
                Start free trial <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center gap-2 rounded-full px-7 h-12 text-sm font-semibold bg-secondary/70 border border-border/60 text-foreground hover:bg-secondary transition-colors"
              >
                Talk to sales
              </button>
            </div>
            <div className="mt-12 pt-8 border-t border-border/60 grid grid-cols-3 gap-6 max-w-lg">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Product mock */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 -m-10 rounded-full bg-primary/10 blur-[100px]" />
            <div className="relative glass-elevated rounded-3xl p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Payroll · This month</div>
                  <div className="font-display text-3xl font-bold text-foreground mt-1">Rs 1,240,000</div>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                  +2.4%
                </span>
              </div>

              <div className="mt-6 h-2.5 w-full rounded-full overflow-hidden flex">
                <span className="h-full" style={{ width: "84%", background: "var(--gradient-emerald)" }} />
                <span className="h-full bg-primary/40" style={{ width: "8%" }} />
                <span className="h-full bg-primary/25" style={{ width: "5%" }} />
                <span className="h-full bg-muted" style={{ width: "3%" }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
                <span>Salaries 84%</span><span>NPF 8%</span><span>CSG 5%</span><span>PAYE 3%</span>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { label: "470 payslips generated", meta: "Ready" },
                  { label: "Clock-in · 08:00", meta: "Approved" },
                  { label: "Leave · 3 days", meta: "Approved" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-xl bg-secondary/50 border border-border/50 px-4 py-3">
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <span className="h-6 w-6 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </span>
                      {row.label}
                    </div>
                    <span className="text-xs text-primary">{row.meta}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client marquee */}
      <section className="py-10 border-y border-border/50 overflow-hidden">
        <p className="text-center text-xs text-muted-foreground mb-6">
          Run by businesses across Mauritius — from 5 to 500+ employees
        </p>
        <div className="relative">
          <div className="flex w-max marquee-track gap-12 px-6">
            {[...clients, ...clients].map((c, i) => (
              <span key={`${c}-${i}`} className="font-display text-lg font-semibold text-muted-foreground/50 whitespace-nowrap">
                {c}
              </span>
            ))}
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
              <div key={f.title} className="premium-card p-6 hover:-translate-y-1 transition-all duration-300">
                <div className="h-11 w-11 rounded-xl bg-primary/12 border border-primary/25 flex items-center justify-center mb-5">
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
              <div key={s.n} className="rounded-2xl border border-border/60 bg-card/60 p-7">
                <div className="font-script text-3xl text-primary">{s.n}</div>
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
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-8 border bg-card/70 relative ${p.popular ? "border-primary/50 ring-1 ring-primary/25" : "border-border/60"}`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-8 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-full px-3 py-1 text-primary-foreground" style={{ background: "var(--gradient-emerald)" }}>
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold text-foreground">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{p.desc}</p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(p.name === "Enterprise" ? "/contact" : "/auth")}
                  className={`w-full mt-8 rounded-full h-11 text-sm font-semibold transition-colors ${p.popular ? "text-primary-foreground" : "border border-border/60 text-foreground hover:bg-secondary"}`}
                  style={p.popular ? { background: "var(--gradient-emerald)" } : undefined}
                >
                  {p.name === "Enterprise" ? "Contact sales" : "Start free trial"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="eyebrow mb-3">Testimonials</div>
          <h2 className="font-display text-3xl sm:text-5xl text-foreground max-w-2xl">
            Trusted by teams across the island.
          </h2>
          <div className="grid md:grid-cols-3 gap-5 mt-12">
            {testimonials.map((t) => (
              <div key={t.name} className="premium-card p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed">"{t.text}"</p>
                <div className="mt-5">
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-5 sm:px-8 border-t border-border/50">
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
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 rounded-full px-7 h-12 text-sm font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-emerald)", boxShadow: "var(--shadow-glow)" }}
              >
                Start free trial <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center gap-2 rounded-full px-7 h-12 text-sm font-semibold bg-secondary/70 border border-border/60 text-foreground hover:bg-secondary transition-colors"
              >
                Talk to sales <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};

export default Landing;
