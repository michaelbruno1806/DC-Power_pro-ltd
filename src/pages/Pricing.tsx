import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";


const tiers = [
  {
    name: "Starter",
    price: "MUR 1,500",
    suffix: "/ month",
    description: "Up to 10 employees. All payroll essentials.",
    features: ["Up to 10 employees", "Monthly PAYE/CSG/NSF", "Payslip PDFs", "Email support"],
  },
  {
    name: "Business",
    price: "MUR 3,500",
    suffix: "/ month",
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
    price: "Custom",
    suffix: "",
    description: "Unlimited employees, multi-company, accountant mode.",
    features: ["Unlimited employees", "Accountant multi-company", "Custom integrations", "SLA"],
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <MarketingNav />
    <div className="bg-hero pt-32 pb-14 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto text-center animate-fade-up">
        <p className="font-script text-3xl text-primary">Plans that fit —</p>
        <h1 className="font-display text-4xl sm:text-6xl text-foreground mt-1">
          Simple, transparent pricing
        </h1>
        <p className="text-muted-foreground mt-4">14-day free trial · Cancel anytime · MUR billing</p>
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((t) => (

          <div
            key={t.name}
            className={`premium-card p-7 flex flex-col ${
              t.featured ? "border-primary/50 shadow-lg" : ""
            }`}
          >
            {t.featured && (
              <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-3">
                Most popular
              </div>
            )}
            <h2 className="font-display text-2xl font-medium text-foreground">{t.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
            <div className="my-6">
              <span className="font-display text-4xl font-medium text-foreground">{t.price}</span>
              <span className="text-sm text-muted-foreground ml-1">{t.suffix}</span>
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
              variant={t.featured ? "default" : "outline"}
              style={
                t.featured
                  ? { background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }
                  : undefined
              }
              disabled
            >
              Coming soon
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-10">
        Secure online payments coming soon. Contact us at sales@dcpayroll.mu for early access.
      </p>
    </div>
    <MarketingFooter />
  </div>
);


export default Pricing;
