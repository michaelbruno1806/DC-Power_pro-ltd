import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, MessageCircle, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const Contact = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse({ name, email, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    // Open WhatsApp with pre-filled message
    const whatsappMsg = encodeURIComponent(`Hi, I'm ${parsed.data.name} (${parsed.data.email}).\n\n${parsed.data.message}`);
    window.open(`https://wa.me/23057181234?text=${whatsappMsg}`, "_blank");
    toast.success("Opening WhatsApp...");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Button variant="ghost" onClick={() => navigate("/landing")} className="mb-8 gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="eyebrow text-primary mb-3">Contact Us</div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">Get in touch</h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Have questions about DC Payroll? We'd love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-12">
          {/* Form */}
          <div className="premium-card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-secondary/40" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="bg-secondary/40" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Message</Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" rows={5} className="bg-secondary/40 resize-none" />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2"
                style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}
              >
                <Send className="h-4 w-4" /> Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {[
              { icon: MessageCircle, label: "WhatsApp", value: "+230 5718 1234", href: "https://wa.me/23057181234", color: "text-green-500" },
              { icon: Mail, label: "Email", value: "hello@dcpayroll.mu", href: "mailto:hello@dcpayroll.mu", color: "text-primary" },
              { icon: Phone, label: "Phone", value: "+230 5718 1234", href: "tel:+23057181234", color: "text-primary" },
            ].map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="premium-card p-5 flex items-center gap-4 group hover:-translate-y-0.5 transition-all">
                <div className="h-10 w-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                  <div className="text-sm font-medium text-foreground">{c.value}</div>
                </div>
              </a>
            ))}

            <div className="premium-card p-5">
              <h3 className="font-display text-sm font-medium text-foreground mb-2">Office</h3>
              <p className="text-sm text-muted-foreground">Port Louis, Mauritius</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
