import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Check, Star, Shield, Users, BarChart3, Globe2, Zap,
  FileText, Clock, ChevronRight, Menu, X, Moon, Sun
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const features = [
  { icon: Users, title: "Employee Management", desc: "Add, edit, and manage employees with complete profiles, bank details, and employment history." },
  { icon: BarChart3, title: "Automatic Payroll", desc: "One-click payroll calculation with tax, CSG, NSF, and levy computations built in." },
  { icon: FileText, title: "Payslips & Reports", desc: "Generate professional PDF payslips and export Excel/CSV reports for MRA filings." },
  { icon: Shield, title: "Multi-Tenant Security", desc: "Complete data isolation between companies with role-based access control." },
  { icon: Globe2, title: "Mauritius Compliant", desc: "Pre-configured PAYE brackets, CSG/NSF rates, and MRA filing templates." },
  { icon: Clock, title: "Leave & Attendance", desc: "Integrated leave management that auto-feeds into payroll calculations." },
];

const plans = [
  {
    name: "Basic",
    price: "MUR 1,500",
    period: "/month",
    desc: "For small businesses up to 10 employees",
    features: ["Up to 10 employees", "Payroll calculation", "PDF payslips", "Basic reports", "Email support"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "MUR 3,500",
    period: "/month",
    desc: "For growing companies up to 50 employees",
    features: ["Up to 50 employees", "Everything in Basic", "MRA filing exports", "Leave management", "Multi-user access", "Priority support"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large organizations with custom needs",
    features: ["Unlimited employees", "Everything in Pro", "Custom integrations", "Dedicated account manager", "SLA guarantee", "On-premise option"],
    cta: "Contact Sales",
    popular: false,
  },
];

const testimonials = [
  { name: "Ravi Doorgakant", role: "CFO, TechMauritius Ltd", text: "DC Payroll transformed how we handle monthly payroll. What took 2 days now takes 30 minutes.", stars: 5 },
  { name: "Anisha Doorgakant", role: "HR Manager, Island Exports", text: "The MRA compliance features alone are worth it. No more manual filing errors.", stars: 5 },
  { name: "Jean-Pierre L.", role: "Director, Créole Services", text: "Best payroll platform in Mauritius. The interface is beautiful and the support is exceptional.", stars: 5 },
];

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center font-display font-semibold text-sm text-primary-foreground"
              style={{ background: "var(--gradient-emerald)" }}
            >
              DC
            </div>
            <span className="font-display font-semibold text-lg text-foreground tracking-wide">DC Payroll</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <button onClick={() => navigate("/about")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</button>
            <button onClick={() => navigate("/contact")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</button>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-secondary/50 transition-colors text-muted-foreground">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button variant="ghost" onClick={() => navigate("/auth")} className="text-sm">Sign In</Button>
            <Button onClick={() => navigate("/auth")} className="text-sm gap-1" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-foreground">
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
            <a href="#features" className="block text-sm text-muted-foreground">Features</a>
            <a href="#pricing" className="block text-sm text-muted-foreground">Pricing</a>
            <button onClick={() => navigate("/about")} className="block text-sm text-muted-foreground">About</button>
            <button onClick={() => navigate("/contact")} className="block text-sm text-muted-foreground">Contact</button>
            <Button onClick={() => navigate("/auth")} className="w-full mt-2" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
              Get Started
            </Button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.05] blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" /> Built for Mauritius businesses
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold text-foreground leading-[1.1] tracking-tight">
            Payroll made
            <br />
            <span className="text-primary">effortless</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            The premium payroll platform for Mauritian businesses. Automate calculations, generate payslips, and stay MRA-compliant — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-base px-8 h-12 gap-2"
              style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}
            >
              Start 14-Day Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/contact")} className="text-base px-8 h-12 gap-2 border-border/60">
              Book a Demo <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">No credit card required · Free for 14 days</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="eyebrow text-primary mb-3">Features</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">Everything you need to run payroll</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">From employee onboarding to MRA filing, DC Payroll covers the full payroll lifecycle.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="premium-card p-6 group hover:-translate-y-0.5 transition-all duration-300">
                <div className="h-10 w-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-medium text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-secondary/20 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="eyebrow text-primary mb-3">Pricing</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mt-3">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`premium-card p-8 relative ${plan.popular ? "border-primary/40 ring-1 ring-primary/20" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display text-xl font-medium text-foreground">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.desc}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-8"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate(plan.name === "Enterprise" ? "/contact" : "/auth")}
                  style={plan.popular ? { background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" } : undefined}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="eyebrow text-primary mb-3">Testimonials</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">Trusted by businesses across Mauritius</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="premium-card p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-[#d4af37] fill-[#d4af37]" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="text-sm font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border/40 bg-secondary/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">Ready to simplify your payroll?</h2>
          <p className="text-muted-foreground mt-3 text-lg">Join hundreds of Mauritian businesses already using DC Payroll.</p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="mt-8 text-base px-8 h-12 gap-2"
            style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}
          >
            Get Started for Free <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10 px-6 bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center font-display font-semibold text-sm text-primary-foreground"
              style={{ background: "var(--gradient-emerald)" }}
            >
              DC
            </div>
            <span className="font-display font-medium text-foreground">DC Payroll</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              © {new Date().getFullYear()} DC Payroll · All rights reserved
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
              Powered by <span className="text-[#d4af37]/90 font-medium">MB18 Solutions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
