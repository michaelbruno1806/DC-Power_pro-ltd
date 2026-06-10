import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyId } from "@/hooks/use-company-id";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, PartyPopper, Trash2, Calendar } from "lucide-react";
import PeriodSelector from "@/components/PeriodSelector";

interface Holiday {
  id: string;
  holiday_date: string;
  name: string;
  is_recurring: boolean;
}

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  holiday_date: z.string().min(1, "Date required"),
  is_recurring: z.boolean(),
});

const Holidays = () => {
  const companyId = useCompanyId();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [form, setForm] = useState({ name: "", holiday_date: "", is_recurring: false });

  const fetchAll = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("public_holidays")
      .select("*")
      .eq("company_id", companyId)
      .order("holiday_date");
    if (error) toast.error(error.message);
    else setHolidays(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [companyId]);

  const submit = async () => {
    if (!companyId) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const { error } = await supabase.from("public_holidays").insert({
      company_id: companyId,
      name: form.name.trim(),
      holiday_date: form.holiday_date,
      is_recurring: form.is_recurring,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Holiday added");
    setOpen(false);
    setForm({ name: "", holiday_date: "", is_recurring: false });
    fetchAll();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this holiday?")) return;
    const { error } = await supabase.from("public_holidays").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Removed"); fetchAll(); }
  };

  const filtered = holidays.filter(h => {
    const d = new Date(h.holiday_date);
    return d.getFullYear() === filterYear && (d.getMonth() + 1) === filterMonth;
  });

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-2">Configuration</div>
          <h1 className="heading-display text-foreground flex items-center gap-3">
            <PartyPopper className="h-7 w-7 text-primary" /> Public Holidays
          </h1>
          <div className="divider-elegant mt-3" />
          <p className="text-sm text-muted-foreground mt-3">
            Manage public holidays. Hours worked on a public holiday qualify for 2× overtime.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-10 px-5" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
                <Plus className="h-4 w-4" /> Add Holiday
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader><DialogTitle className="font-display text-2xl font-medium">Add Public Holiday</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Independence Day" className="bg-secondary/40" />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={form.holiday_date} onChange={e => setForm({...form, holiday_date: e.target.value})} className="bg-secondary/40" />
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={form.is_recurring} onChange={e => setForm({...form, is_recurring: e.target.checked})} className="rounded border-border" />
                  Recurring annually (same date every year)
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <PeriodSelector
        month={filterMonth}
        year={filterYear}
        onChange={(m, y) => { setFilterMonth(m); setFilterYear(y); }}
      />

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/20">
              {["Date","Day","Name","Type",""].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No holidays for {filterYear}</td></tr>
            ) : filtered.map(h => {
              const d = new Date(h.holiday_date);
              return (
                <tr key={h.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-foreground">{h.holiday_date}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "long" })}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> {h.name}
                  </td>
                  <td className="px-5 py-3.5">
                    {h.is_recurring && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-primary/10 text-primary">Recurring</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => remove(h.id)} className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};

export default Holidays;
