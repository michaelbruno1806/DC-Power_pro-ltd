import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

type Billing = "monthly" | "annual";

const tiers = [
  {
    name: "Starter",
    monthly: 1500,
    description: "Up to 10 employees. All payroll essentials.",
    features: ["Up to 10 employees", "Monthly PAYE/CSG/NSF", "Payslip PDFs", "Email support"],
  },
  {
    name: "Business",
    monthly: 3500,
    description: "Up to 50 employees. Leave & holidays automation.",
    features: [
      "Up to 50 employees",
      "Leaves & holidays engine",
      "MRA filing exports",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    description: "Unlimited employees, multi-company, accountant mode.",
    features: ["Unlimited employees", "Accountant multi-company", "Custom integrations", "SLA"],
  },
];

const fmt = (n: number) => `MUR ${n.toLocaleString("en-US")}`;

const Pricing = () => {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<Billing>("monthly");
  const [selected, setSelected] = useState<string>("Business");

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <div className="bg-hero pt-32 pb-14 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto text-center animate-fade-up">
          <p className="font-script text-3xl text-primary">Plans that fit —</p>
          <h1 className="font-display text-4xl sm:text-6xl text-foreground mt-1">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground mt-4">14-day free trial · Cancel anytime · MUR billing</p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center rounded-full border border-border/60 bg-card/70 p-1">
            {(["monthly", "annual"] as Billing[]).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`rounded-full px-5 h-9 text-sm font-semibold transition-all capitalize ${
                  billing === b
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={billing === b ? { background: "var(--gradient-emerald)" } : undefined}
              >
                {b}
                {b === "annual" && (
                  <span
                    className={`ml-2 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                      billing === "annual" ? "bg-white/20 text-primary-foreground" : "bg-primary/15 text-primary"
                    }`}
                  >
                    2 months free
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => {
            const isSelected = selected === t.name;
            const annualTotal = t.monthly ? t.monthly * 10 : null;
            return (
              <div
                key={t.name}
                onClick={() => setSelected(t.name)}
                className={`premium-card p-7 flex flex-col cursor-pointer transition-all duration-300 relative ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/40 shadow-[var(--shadow-glow)] -translate-y-1"
                    : t.featured
                      ? "border-primary/50 shadow-lg"
                      : "hover:border-primary/30"
                }`}
              >
                {isSelected && (
                  <span
                    className="absolute -top-3 left-7 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-full px-3 py-1 text-primary-foreground"
                    style={{ background: "var(--gradient-emerald)" }}
                  >
                    Selected plan
                  </span>
                )}
                {!isSelected && t.featured && (
                  <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-3">
                    Most popular
                  </div>
                )}
                <h2 className="font-display text-2xl font-medium text-foreground">{t.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                <div className="my-6">
                  {t.monthly ? (
                    <>
                      <span className="font-display text-4xl font-medium text-foreground">
                        {billing === "monthly" ? fmt(t.monthly) : fmt(Math.round(annualTotal! / 12))}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">/ month</span>
                      {billing === "annual" && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground line-through">{fmt(t.monthly * 12)}/yr</span>
                          <span className="text-foreground font-medium">{fmt(annualTotal!)}/yr</span>
                          <span className="inline-flex items-center gap-1 text-primary">
                            <BadgePercent className="h-3.5 w-3.5" /> Save {fmt(t.monthly * 2)}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="font-display text-4xl font-medium text-foreground">Custom</span>
                  )}
                </div>
                <ul className="space-y-2 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 h-11"
                  variant={isSelected ? "default" : "outline"}
                  style={
                    isSelected
                      ? { background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }
                      : undefined
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(t.name);
                    navigate(t.name === "Enterprise" ? "/contact" : "/auth");
                  }}
                >
                  {t.name === "Enterprise" ? "Contact sales" : isSelected ? "Start free trial" : `Choose ${t.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          {billing === "annual"
            ? "Annual plans are billed once a year and include 2 months free."
            : "Monthly plans are billed each month — switch to annual to get 2 months free."}
          {" "}Secure online payments coming soon. Contact us at sales@dcpayroll.mu for early access.
        </p>
      </div>
      <MarketingFooter />
    </div>
  );
};

export default Pricing;
