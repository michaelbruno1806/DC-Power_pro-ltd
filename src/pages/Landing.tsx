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
  const primaryPath = user ? (company?.setup_completed ? "/payroll" : "/onboarding") : "/auth?mode=signup";
  const primaryLabel = user ? "Open payroll" : "Start free trial";

  return (
    <div className="landing-editorial min-h-screen bg-background text-foreground">
      <MarketingNav />

      <main>
        <section className="landing-hero pt-20" aria-labelledby="landing-title">
          <div className="landing-masthead mx-auto flex max-w-7xl items-center justify-between border-b border-border px-5 py-4 sm:px-8">
            <span className="font-display text-sm font-bold uppercase text-foreground">DC Payroll <span className="text-primary">/ Mauritius</span></span>
            <span className="hidden text-xs font-medium uppercase text-muted-foreground sm:block">Payroll, considered from every angle.</span>
          </div>
          <div className="mx-auto grid max-w-7xl lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div className="landing-hero-copy flex min-h-[550px] flex-col justify-between px-5 pb-12 pt-12 sm:px-8 sm:pt-16 lg:min-h-[630px] lg:border-r lg:border-border lg:px-12 lg:pb-14 lg:pt-20">
              <div>
                <p className="landing-kicker mb-7 text-xs font-bold uppercase text-primary">Mauritius payroll system · Online</p>
                <h1 id="landing-title" className="max-w-3xl font-display text-5xl font-extrabold leading-[0.98] text-foreground sm:text-6xl xl:text-[5.8rem]">
                  Payroll<br />operations,<br /><span className="text-primary">under control.</span>
                </h1>
              </div>
              <div className="mt-10 grid gap-8 border-t border-border pt-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div>
                  <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Attendance, salaries, leaves, statutory filings and payslips — connected in one secure workflow built for Mauritius.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button onClick={() => navigate(primaryPath)} size="lg" className="landing-action h-12 rounded-sm px-6 font-semibold">
                      {primaryLabel} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button onClick={() => navigate("/pricing")} variant="outline" size="lg" className="h-12 rounded-sm px-6">View pricing</Button>
                  </div>
                </div>
                <span className="hidden font-display text-5xl font-semibold text-primary/40 md:block" aria-hidden="true">↗</span>
              </div>
            </div>

            <div className="landing-ledger relative flex min-h-[460px] flex-col justify-between overflow-hidden bg-foreground px-5 pb-9 pt-9 text-background sm:px-8 lg:min-h-[630px] lg:px-10 lg:pb-12 lg:pt-12">
              <div className="relative z-10 flex items-center justify-between border-b border-background/20 pb-5">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase"><Activity className="h-4 w-4 text-primary" /> Payroll control</span>
                <span className="text-xs text-background/60">01 / 03</span>
              </div>
              <div className="landing-ledger-mark absolute right-0 top-20 select-none font-display font-extrabold text-background/5" aria-hidden="true">DC</div>
              <div className="relative z-10 mt-8">
                <p className="text-xs font-semibold uppercase text-background/60">Payroll · October 2026</p>
                <p className="mt-3 font-display text-4xl font-bold sm:text-5xl">Rs 1,240,000</p>
                <div className="mt-3 flex items-center justify-between text-xs text-background/65"><span>Gross payroll</span><span className="text-primary">Draft</span></div>
                <div className="mt-8 flex h-24 items-end gap-2 border-b border-background/25">
                  {[42, 68, 54, 82, 64, 94, 76, 88].map((height, index) => (
                    <span key={index} className={`w-full ${index === 5 ? "bg-primary" : "bg-background/20"}`} style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
              <div className="relative z-10 mt-10">
                {[
                  { label: "Employee records", meta: "Complete" },
                  { label: "PAYE · CSG · PRGF", meta: "Calculated" },
                  { label: "Payslips & MRA returns", meta: "Ready" },
                ].map((row, index) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 border-t border-background/20 py-3.5 text-sm">
                    <span className="flex items-center gap-3"><span className="text-xs text-primary">0{index + 1}</span>{row.label}</span>
                    <span className="flex items-center gap-1.5 text-xs text-background/65"><Check className="h-3.5 w-3.5 text-primary" />{row.meta}</span>
                  </div>
                ))}
                <Button onClick={() => navigate(primaryPath)} variant="ghost" className="mt-4 h-auto w-full justify-between rounded-none border-t border-background/20 px-0 pt-5 text-left text-xs text-background hover:bg-transparent hover:text-primary">
                  Company → Employees → Payroll → Filing <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="landing-stats border-y border-border bg-secondary/30">
          <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-border">
            {stats.map((s) => <div key={s.label} className="px-4 py-5 sm:px-8"><strong className="block font-display text-xl text-foreground sm:text-3xl">{s.value}</strong><span className="mt-1 block text-[10px] uppercase text-muted-foreground sm:text-xs">{s.label}</span></div>)}
          </div>
        </div>

        <section id="features" className="landing-section px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 border-b border-border pb-9 md:grid-cols-[1fr_1fr] md:items-end">
              <div><p className="landing-kicker mb-4 text-xs font-bold uppercase text-primary">01 / What's inside</p><h2 className="max-w-lg font-display text-4xl font-semibold sm:text-5xl">Everything HR needs.</h2></div>
              <p className="max-w-md text-muted-foreground md:justify-self-end">One platform, every payroll job. Built for the way Mauritian businesses actually work.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3">
              {features.map((f, index) => (
                <div key={f.title} className="landing-feature group border-b border-border px-1 py-9 sm:px-6 lg:min-h-[225px]">
                  <div className="mb-10 flex items-start justify-between"><f.icon className="h-6 w-6 text-primary" strokeWidth={1.5} /><span className="text-xs text-muted-foreground">0{index + 1}</span></div>
                  <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section border-y border-border bg-secondary/30 px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <p className="landing-kicker mb-4 text-xs font-bold uppercase text-primary">02 / How it works</p>
            <h2 className="max-w-xl font-display text-4xl font-semibold sm:text-5xl">Live in an afternoon.</h2>
            <div className="mt-12 grid border-t border-border md:grid-cols-3">
              {steps.map((s) => <div key={s.n} className="border-b border-border py-8 md:border-b-0 md:px-7 md:first:pl-0 md:last:pr-0"><div className="mb-10 font-display text-5xl font-semibold text-primary/60">{s.n}</div><h3 className="font-display text-xl font-semibold">{s.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p></div>)}
            </div>
          </div>
        </section>

        <section className="landing-section px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20">
            <div><p className="landing-kicker mb-4 text-xs font-bold uppercase text-primary">03 / Mauritius compliance</p><h2 className="font-display text-4xl font-semibold sm:text-5xl">Statutory rates, already configured.</h2><p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">PAYE, CSG/NSF, PRGF and the training levy are calculated on every run, and your MRA filing deadline is always the end of the month following the payroll period.</p><div className="mt-8 flex flex-wrap gap-2">{["PAYE", "CSG / NSF", "PRGF", "Training levy", "MRA CSV", "Bank batch"].map((t) => <span key={t} className="border border-primary/30 px-3 py-1.5 text-xs text-primary">{t}</span>)}</div></div>
            <div className="grid grid-cols-2 border-t border-l border-border">
              {[
                { icon: BarChart3, k: "Auto-calculated", v: "Every deduction" },
                { icon: Globe2, k: "MUR ready", v: "Multi-currency" },
                { icon: Clock, k: "Deadlines", v: "Tracked monthly" },
                { icon: Shield, k: "Audit logs", v: "Who did what" },
              ].map((c) => <div key={c.k} className="flex min-h-40 flex-col justify-between border-b border-r border-border p-5 sm:p-7"><c.icon className="h-6 w-6 text-primary" strokeWidth={1.5} /><div><h3 className="font-display text-lg font-semibold">{c.k}</h3><p className="text-sm text-muted-foreground">{c.v}</p></div></div>)}
            </div>
          </div>
        </section>

        <section id="pricing" className="landing-section border-y border-border bg-secondary/30 px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-8 border-b border-border pb-10">
              <div><p className="landing-kicker mb-4 text-xs font-bold uppercase text-primary">04 / Pricing</p><h2 className="font-display text-4xl font-semibold sm:text-5xl">Simple, transparent pricing.</h2><p className="mt-4 text-muted-foreground">Start free for 14 days. No credit card required.</p></div>
              <div className="flex border border-border p-1" role="group" aria-label="Billing period">
                {(["monthly", "annual"] as const).map((b) => <Button key={b} variant={billing === b ? "default" : "ghost"} onClick={() => setBilling(b)} aria-pressed={billing === b} className="h-10 rounded-none px-4 capitalize">{b}{b === "annual" && <span className="ml-2 text-[10px]">2 months free</span>}</Button>)}
              </div>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {plans.map((p) => {
                const isSelected = selectedPlan === p.name;
                return <div key={p.name} className={`landing-plan relative flex flex-col border p-6 sm:p-8 ${isSelected ? "border-primary bg-card" : "border-border bg-background"}`}>
                  <div className="mb-7 flex items-center justify-between"><h3 className="font-display text-xl font-semibold">{p.name}</h3>{(isSelected || p.popular) && <span className="text-[10px] font-semibold uppercase text-primary">{isSelected ? "Selected plan" : "Most popular"}</span>}</div>
                  <div className="flex items-baseline gap-1"><span className="font-display text-4xl font-bold">{p.monthly ? `Rs ${(billing === "monthly" ? p.monthly : Math.round((p.monthly * 10) / 12)).toLocaleString("en-US")}` : "Custom"}</span>{p.monthly && <span className="text-sm text-muted-foreground">/month</span>}</div>
                  {p.monthly && billing === "annual" && <div className="mt-2 flex flex-wrap items-center gap-2 text-xs"><span className="text-muted-foreground line-through">Rs {(p.monthly * 12).toLocaleString("en-US")}/yr</span><span>Rs {(p.monthly * 10).toLocaleString("en-US")}/yr</span><span className="inline-flex items-center gap-1 text-primary"><BadgePercent className="h-3.5 w-3.5" />Save Rs {(p.monthly * 2).toLocaleString("en-US")}</span></div>}
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                  <ul className="mb-8 mt-8 flex-1 space-y-3">{p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>)}</ul>
                  <Button onClick={() => { setSelectedPlan(p.name); navigate(p.name === "Enterprise" ? "/contact" : primaryPath); }} variant={isSelected ? "default" : "outline"} className="h-11 w-full rounded-sm">{p.name === "Enterprise" ? "Contact sales" : isSelected ? primaryLabel : `Choose ${p.name}`}</Button>
                  {!isSelected && <Button onClick={() => setSelectedPlan(p.name)} variant="ghost" className="mt-2 h-8 w-full rounded-none text-xs text-muted-foreground">Select plan</Button>}
                </div>;
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="landing-section px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_1.3fr]"><div><p className="landing-kicker mb-4 text-xs font-bold uppercase text-primary">05 / FAQ</p><h2 className="font-display text-4xl font-semibold sm:text-5xl">Questions, answered.</h2></div><div className="border-t border-border">{faqs.map((f) => <div key={f.q} className="border-b border-border py-6"><h3 className="font-display text-lg font-semibold">{f.q}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p></div>)}</div></div></section>

        <section id="contact" className="landing-section bg-foreground px-5 py-20 text-background sm:px-8 lg:py-24"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-end"><div><p className="mb-5 text-xs font-semibold uppercase text-primary">Ready when you are</p><h2 className="max-w-2xl font-display text-4xl font-semibold sm:text-6xl">Run your next payroll here.</h2></div><div className="flex shrink-0 flex-wrap gap-3"><Button onClick={() => navigate(primaryPath)} className="landing-action h-12 rounded-sm px-6">{primaryLabel}<ArrowRight className="ml-2 h-4 w-4" /></Button><Button onClick={() => navigate("/contact")} variant="outline" className="h-12 rounded-sm border-background/50 bg-transparent px-6 text-background hover:text-foreground">Talk to sales<ChevronRight className="ml-2 h-4 w-4" /></Button></div></div></section>
      </main>
      <MarketingFooter />
    </div>
  );
};

export default Landing;
