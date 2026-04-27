import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Clock, Trash2 } from "lucide-react";

interface WorkingDayConfig {
  id: string;
  year: number;
  month: number | null;
  working_days: number;
  hours_per_week: number;
}

const months = ["—","January","February","March","April","May","June","July","August","September","October","November","December"];

const schema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).nullable(),
  working_days: z.number().int().min(1).max(31),
  hours_per_week: z.number().min(1).max(80),
});

const WorkingDays = () => {
  const { companyId } = useAuth();
  const [configs, setConfigs] = useState<WorkingDayConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: "" as "" | number,
    working_days: 22,
    hours_per_week: 45,
  });

  const fetchAll = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("working_day_configs")
      .select("*")
      .eq("company_id", companyId)
      .order("year", { ascending: false })
      .order("month", { ascending: true, nullsFirst: true });
    if (error) toast.error(error.message);
    else setConfigs(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [companyId]);

  const submit = async () => {
    if (!companyId) return;
    const payload = {
      year: form.year,
      month: form.month === "" ? null : form.month,
      working_days: form.working_days,
      hours_per_week: form.hours_per_week,
    };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const { error } = await supabase.from("working_day_configs").upsert(
      { company_id: companyId, ...payload },
      { onConflict: "company_id,year,month" },
    );
    if (error) { toast.error(error.message); return; }
    toast.success("Configuration saved");
    setOpen(false);
    fetchAll();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this configuration?")) return;
    const { error } = await supabase.from("working_day_configs").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetchAll(); }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-2">Configuration</div>
          <h1 className="heading-display text-foreground flex items-center gap-3">
            <Clock className="h-7 w-7 text-primary" /> Working Days & Hours
          </h1>
          <div className="divider-elegant mt-3" />
          <p className="text-sm text-muted-foreground mt-3">
            Set the standard working days per month and weekly hours used to compute pro-rated salary, unpaid leave, and overtime rates.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-10 px-5" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
              <Plus className="h-4 w-4" /> Add Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader><DialogTitle className="font-display text-2xl font-medium">Working Day Configuration</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Year *</Label>
                  <Input type="number" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} className="bg-secondary/40" />
                </div>
                <div className="space-y-2">
                  <Label>Month (optional)</Label>
                  <Select value={form.month === "" ? "all" : String(form.month)} onValueChange={v => setForm({...form, month: v === "all" ? "" : Number(v)})}>
                    <SelectTrigger className="bg-secondary/40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All months (year default)</SelectItem>
                      {months.slice(1).map((m, i) => <SelectItem key={m} value={String(i+1)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Working Days *</Label>
                  <Input type="number" value={form.working_days} onChange={e => setForm({...form, working_days: Number(e.target.value)})} className="bg-secondary/40" />
                </div>
                <div className="space-y-2">
                  <Label>Hours / Week *</Label>
                  <Input type="number" value={form.hours_per_week} onChange={e => setForm({...form, hours_per_week: Number(e.target.value)})} className="bg-secondary/40" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/80">
                Tip: Leave Month as "All months" for a yearly default. Add a per-month entry only when it differs (e.g. months with extra public holidays).
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <GlassCard className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Platform default</div>
            <div className="font-display text-xl font-semibold text-foreground mt-1">22 days · 45 h/week</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Hourly rate (basic ÷ 195h)</div>
            <div className="font-display text-xl font-semibold text-foreground mt-1">basic / 195</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Daily rate (basic ÷ working days)</div>
            <div className="font-display text-xl font-semibold text-foreground mt-1">basic / N</div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-secondary/20">
              {["Year","Month","Working Days","Hours / Week",""].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">Loading...</td></tr>
            ) : configs.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No configurations yet — platform defaults are in use.</td></tr>
            ) : configs.map(c => (
              <tr key={c.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                <td className="px-5 py-3.5 font-medium text-foreground">{c.year}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{c.month ? months[c.month] : "All months"}</td>
                <td className="px-5 py-3.5 text-foreground tabular-nums">{c.working_days}</td>
                <td className="px-5 py-3.5 text-foreground tabular-nums">{c.hours_per_week}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => remove(c.id)} className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default WorkingDays;
