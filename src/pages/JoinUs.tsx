import { useState } from "react";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Heart, Rocket, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const roles = [
  { title: "Payroll Support Specialist", type: "Full-time · Port Louis", desc: "Help Mauritian businesses onboard and run their monthly payroll flawlessly." },
  { title: "Frontend Engineer (React)", type: "Full-time · Hybrid", desc: "Build the interfaces payroll officers use every single month." },
  { title: "Implementation Consultant", type: "Contract · Mauritius", desc: "Migrate client data, configure statutory rates and train HR teams." },
];

const perks = [
  { icon: Rocket, title: "Real ownership", desc: "Small team, visible impact, shipping every week." },
  { icon: Heart, title: "Flexible work", desc: "Hybrid schedule and a genuine respect for your time." },
  { icon: Briefcase, title: "Grow fast", desc: "Learn payroll, compliance and product from the ground up." },
];

const applySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  role: z.string().trim().min(1, "Please tell us which role").max(120),
  message: z.string().trim().min(1, "A short note is required").max(2000),
});

const JoinUs = () => {
  const [form, setForm] = useState({ name: "", email: "", role: "", message: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = applySchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const msg = encodeURIComponent(
      `Application — ${parsed.data.role}\n\n${parsed.data.name} (${parsed.data.email})\n\n${parsed.data.message}`,
    );
    window.open(`https://wa.me/23057181234?text=${msg}`, "_blank");
    toast.success("Opening WhatsApp to send your application...");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      <section className="bg-hero pt-32 pb-16 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="font-script text-3xl text-primary">Come build with us —</p>
          <h1 className="font-display text-4xl sm:text-6xl text-foreground mt-1">Join Us</h1>
          <p className="text-muted-foreground mt-4 max-w-xl">
            We're a small Mauritian team making payday boring — in the best way.
          </p>
        </div>
      </section>

      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5">
          {perks.map((p) => (
            <div key={p.title} className="premium-card p-6">
              <div className="h-11 w-11 rounded-xl bg-primary/12 border border-primary/25 flex items-center justify-center mb-5">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14 px-5 sm:px-8 bg-secondary/25 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="eyebrow mb-3">Open roles</div>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground">Where we need help</h2>
          <div className="mt-10 space-y-4">
            {roles.map((r) => (
              <div key={r.title} className="rounded-2xl border border-border/60 bg-card/70 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{r.title}</h3>
                  <div className="text-xs text-primary mt-1">{r.type}</div>
                  <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{r.desc}</p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full shrink-0"
                  onClick={() => {
                    setForm((f) => ({ ...f, role: r.title }));
                    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="py-16 px-5 sm:px-8">
        <div className="max-w-2xl mx-auto premium-card p-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">Send your application</h2>
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Full name</Label>
              <Input value={form.name} onChange={set("name")} placeholder="Your name" className="bg-secondary/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" className="bg-secondary/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Role</Label>
              <Input value={form.role} onChange={set("role")} placeholder="Which role?" className="bg-secondary/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">About you</Label>
              <Textarea value={form.message} onChange={set("message")} rows={5} placeholder="A few lines about your experience" className="bg-secondary/40 resize-none" />
            </div>
            <Button type="submit" className="w-full rounded-full gap-2" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
              <Send className="h-4 w-4" /> Submit application
            </Button>
          </form>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};

export default JoinUs;
