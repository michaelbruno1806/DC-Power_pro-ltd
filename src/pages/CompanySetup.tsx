import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Save, ArrowLeft } from "lucide-react";

const CompanySetup = () => {
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", ern: "", brn: "", address: "", city: "", country: "Mauritius",
    phone: "", email: "", director_name: "", director_nic: "",
    pay_period_start_day: "1", pay_period_end_day: "31", mra_due_day: "20",
  });

  useEffect(() => {
    if (!companyId) return;
    supabase.from("companies").select("*").eq("id", companyId).single().then(({ data }) => {
      if (data) setForm({
        name: data.name || "", ern: data.ern || "", brn: data.brn || "",
        address: data.address || "", city: data.city || "", country: data.country || "Mauritius",
        phone: data.phone || "", email: data.email || "",
        director_name: data.director_name || "", director_nic: data.director_nic || "",
        pay_period_start_day: String(data.pay_period_start_day || 1),
        pay_period_end_day: String(data.pay_period_end_day || 31),
        mra_due_day: String(data.mra_due_day || 20),
      });
    });
  }, [companyId]);

  const handleSave = async () => {
    if (!companyId) { toast.error("No company assigned"); return; }
    if (!form.name.trim()) { toast.error("Company name is required"); return; }
    setLoading(true);
    const { error } = await supabase.from("companies").update({
      name: form.name.trim(), ern: form.ern || null, brn: form.brn || null,
      address: form.address || null, city: form.city || null, country: form.country || null,
      phone: form.phone || null, email: form.email || null,
      director_name: form.director_name || null, director_nic: form.director_nic || null,
      pay_period_start_day: parseInt(form.pay_period_start_day),
      pay_period_end_day: parseInt(form.pay_period_end_day),
      mra_due_day: parseInt(form.mra_due_day),
    }).eq("id", companyId);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Company details saved!");
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-2">Company</div>
          <h1 className="heading-display text-foreground flex items-center gap-3">
            <Building2 className="h-7 w-7 text-primary" /> Company Details
          </h1>
          <div className="divider-elegant mt-3" />
          <p className="text-sm text-muted-foreground mt-3">Information used for payslips and MRA filings</p>
        </div>
      </div>

      <GlassCard elevated>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={e => update("name", e.target.value)} placeholder="DC Power Pro Ltd" className="bg-secondary/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ERN</Label>
                <Input value={form.ern} onChange={e => update("ern", e.target.value)} placeholder="ERN123456" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>BRN</Label>
                <Input value={form.brn} onChange={e => update("brn", e.target.value)} placeholder="C12345678" className="bg-secondary/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => update("address", e.target.value)} placeholder="10 Royal Street" className="bg-secondary/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={e => update("city", e.target.value)} placeholder="Port Louis" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={e => update("country", e.target.value)} className="bg-secondary/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="2123456" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="accounts@company.com" className="bg-secondary/50" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Director Name</Label>
              <Input value={form.director_name} onChange={e => update("director_name", e.target.value)} placeholder="Jane Doe" className="bg-secondary/50" />
            </div>
            <div className="space-y-2">
              <Label>Director NIC</Label>
              <Input value={form.director_nic} onChange={e => update("director_nic", e.target.value)} placeholder="D1234567890" className="bg-secondary/50" />
            </div>

            <GlassCard className="mt-4">
              <h3 className="font-semibold mb-3">Payroll Period</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Start Day</Label>
                  <select value={form.pay_period_start_day} onChange={e => update("pay_period_start_day", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-input bg-secondary/50 text-foreground text-sm">
                    {dayOptions.map(d => <option key={d} value={String(d)}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">End Day</Label>
                  <select value={form.pay_period_end_day} onChange={e => update("pay_period_end_day", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-input bg-secondary/50 text-foreground text-sm">
                    {dayOptions.map(d => <option key={d} value={String(d)}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2 mt-3">
                <Label className="text-xs">MRA Due Day</Label>
                <select value={form.mra_due_day} onChange={e => update("mra_due_day", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-input bg-secondary/50 text-foreground text-sm">
                  {dayOptions.map(d => <option key={d} value={String(d)}>{d}</option>)}
                </select>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Deadlines shown on dashboard using this date.</p>
            </GlassCard>
          </div>
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-border">
          <Button onClick={handleSave} disabled={loading} className="gap-2 h-11 px-6 font-medium tracking-wide" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
            <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Company"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2 h-11">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default CompanySetup;
