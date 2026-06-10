import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyId } from "@/hooks/use-company-id";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Building2, Save, ArrowLeft, Plus, Trash2, Upload } from "lucide-react";
import Accountants from "@/components/Accountants";

interface Director {
  id?: string;
  full_name: string;
  nic: string;
  email: string;
  phone: string;
  role: string;
  _new?: boolean;
  _deleted?: boolean;
}

const CompanySetup = () => {
  const companyId = useCompanyId();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "", ern: "", brn: "", tan: "", vat_number: "", logo_url: "",
    address: "", city: "", country: "Mauritius",
    phone: "", email: "",
    accountant_name: "", accountant_email: "",
    pay_period_start_day: "1", pay_period_end_day: "31", mra_due_day: "20",
    local_leave_cumulate: false,
    local_leave_payout_december: false,
    sick_leave_reset_january: true,
  });
  const [directors, setDirectors] = useState<Director[]>([]);

  const loadAll = async () => {
    if (!companyId) return;
    const [{ data: c }, { data: d }] = await Promise.all([
      supabase.from("companies").select("*").eq("id", companyId).single(),
      supabase.from("company_directors").select("*").eq("company_id", companyId).order("created_at"),
    ]);
    if (c) setForm({
      name: c.name || "", ern: c.ern || "", brn: c.brn || "",
      tan: (c as any).tan || "", vat_number: (c as any).vat_number || "",
      logo_url: (c as any).logo_url || "",
      address: c.address || "", city: c.city || "", country: c.country || "Mauritius",
      phone: c.phone || "", email: c.email || "",
      accountant_name: (c as any).accountant_name || "",
      accountant_email: (c as any).accountant_email || "",
      pay_period_start_day: String(c.pay_period_start_day || 1),
      pay_period_end_day: String(c.pay_period_end_day || 31),
      mra_due_day: String(c.mra_due_day || 20),
      local_leave_cumulate: (c as any).local_leave_cumulate ?? false,
      local_leave_payout_december: (c as any).local_leave_payout_december ?? false,
      sick_leave_reset_january: (c as any).sick_leave_reset_january ?? true,
    });
    if (d) setDirectors(d as any);
  };

  useEffect(() => { loadAll(); }, [companyId]);

  const handleLogoUpload = async (file: File) => {
    if (!companyId) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${companyId}/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("company-logos").upload(path, file, { upsert: true });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("company-logos").getPublicUrl(path);
    setForm(prev => ({ ...prev, logo_url: data.publicUrl }));
    setUploading(false);
    toast.success("Logo uploaded");
  };

  const handleSave = async () => {
    if (!companyId) { toast.error("No company assigned"); return; }
    if (!form.name.trim()) { toast.error("Company name is required"); return; }
    setLoading(true);

    const { error } = await supabase.from("companies").update({
      name: form.name.trim(),
      ern: form.ern || null, brn: form.brn || null,
      tan: form.tan || null, vat_number: form.vat_number || null,
      logo_url: form.logo_url || null,
      address: form.address || null, city: form.city || null, country: form.country || null,
      phone: form.phone || null, email: form.email || null,
      accountant_name: form.accountant_name || null,
      accountant_email: form.accountant_email || null,
      pay_period_start_day: parseInt(form.pay_period_start_day),
      pay_period_end_day: parseInt(form.pay_period_end_day),
      mra_due_day: parseInt(form.mra_due_day),
      local_leave_cumulate: form.local_leave_cumulate,
      local_leave_payout_december: form.local_leave_payout_december,
      sick_leave_reset_january: form.sick_leave_reset_january,
    } as any).eq("id", companyId);

    if (error) { setLoading(false); toast.error(error.message); return; }

    // Persist directors
    for (const d of directors) {
      if (d._deleted && d.id) {
        await supabase.from("company_directors").delete().eq("id", d.id);
      } else if (d._new && !d._deleted) {
        if (!d.full_name.trim()) continue;
        await supabase.from("company_directors").insert({
          company_id: companyId,
          full_name: d.full_name.trim(),
          nic: d.nic || null, email: d.email || null,
          phone: d.phone || null, role: d.role || null,
        });
      } else if (d.id && !d._deleted) {
        await supabase.from("company_directors").update({
          full_name: d.full_name, nic: d.nic || null, email: d.email || null,
          phone: d.phone || null, role: d.role || null,
        }).eq("id", d.id);
      }
    }

    setLoading(false);
    toast.success("Company details saved!");
    loadAll();
  };

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  const addDirector = () => setDirectors(prev => [...prev, {
    full_name: "", nic: "", email: "", phone: "", role: "Director", _new: true,
  }]);
  const updateDirector = (idx: number, field: keyof Director, value: string) => {
    setDirectors(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };
  const removeDirector = (idx: number) => {
    setDirectors(prev => {
      const copy = [...prev];
      if (copy[idx].id) copy[idx] = { ...copy[idx], _deleted: true };
      else copy.splice(idx, 1);
      return copy;
    });
  };

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
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="h-16 w-16 rounded-lg object-cover border border-border" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-secondary/40 border border-border flex items-center justify-center text-xs text-muted-foreground">No logo</div>
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                  <span className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border bg-secondary/40 text-sm hover:bg-secondary">
                    <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
                  </span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company Name <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={e => update("name", e.target.value)} placeholder="DC Power Pro Ltd" className="bg-secondary/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>BRN</Label>
                <Input value={form.brn} onChange={e => update("brn", e.target.value)} placeholder="C12345678" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>ERN</Label>
                <Input value={form.ern} onChange={e => update("ern", e.target.value)} placeholder="ERN123456" className="bg-secondary/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>TAN</Label>
                <Input value={form.tan} onChange={e => update("tan", e.target.value)} placeholder="TAN123456" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>VAT No.</Label>
                <Input value={form.vat_number} onChange={e => update("vat_number", e.target.value)} placeholder="VAT12345678" className="bg-secondary/50" />
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
            <GlassCard>
              <h3 className="font-semibold mb-3">Accountant (optional)</h3>
              <div className="grid grid-cols-1 gap-3">
                <Input value={form.accountant_name} onChange={e => update("accountant_name", e.target.value)} placeholder="Accountant name" className="bg-secondary/50" />
                <Input type="email" value={form.accountant_email} onChange={e => update("accountant_email", e.target.value)} placeholder="accountant@firm.com" className="bg-secondary/50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Accountants you invite to this company will be linked to your account.</p>
            </GlassCard>

            <GlassCard>
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
            </GlassCard>

            <GlassCard>
              <h3 className="font-semibold mb-3">Leave Policy</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Local leave cumulates year-on-year</Label>
                    <p className="text-xs text-muted-foreground">If off, balance resets every January</p>
                  </div>
                  <Switch checked={form.local_leave_cumulate} onCheckedChange={v => update("local_leave_cumulate", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Pay out unused local leave in December</Label>
                    <p className="text-xs text-muted-foreground">Auto-payout in last payroll of the year</p>
                  </div>
                  <Switch checked={form.local_leave_payout_december} onCheckedChange={v => update("local_leave_payout_december", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Reset sick leave each January</Label>
                    <p className="text-xs text-muted-foreground">Standard MU practice</p>
                  </div>
                  <Switch checked={form.sick_leave_reset_january} onCheckedChange={v => update("sick_leave_reset_january", v)} />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Directors */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Directors</h3>
            <Button variant="outline" size="sm" onClick={addDirector} className="gap-2">
              <Plus className="h-4 w-4" /> Add Director
            </Button>
          </div>
          <div className="space-y-3">
            {directors.filter(d => !d._deleted).length === 0 && (
              <p className="text-sm text-muted-foreground italic">No directors added yet.</p>
            )}
            {directors.map((d, idx) => d._deleted ? null : (
              <div key={d.id || `new-${idx}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-secondary/20 p-3 rounded-lg border border-border/40">
                <Input value={d.full_name} onChange={e => updateDirector(idx, "full_name", e.target.value)} placeholder="Full name *" className="md:col-span-3 bg-background/40" />
                <Input value={d.nic} onChange={e => updateDirector(idx, "nic", e.target.value)} placeholder="NIC" className="md:col-span-2 bg-background/40" />
                <Input value={d.email} onChange={e => updateDirector(idx, "email", e.target.value)} placeholder="Email" className="md:col-span-3 bg-background/40" />
                <Input value={d.phone} onChange={e => updateDirector(idx, "phone", e.target.value)} placeholder="Phone" className="md:col-span-2 bg-background/40" />
                <Input value={d.role} onChange={e => updateDirector(idx, "role", e.target.value)} placeholder="Role" className="md:col-span-1 bg-background/40" />
                <Button variant="ghost" size="sm" onClick={() => removeDirector(idx)} className="md:col-span-1 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-border">
          <Button onClick={handleSave} disabled={loading} className="gap-2 h-11 px-6 font-medium tracking-wide" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
            <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Company"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2 h-11">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default CompanySetup;
