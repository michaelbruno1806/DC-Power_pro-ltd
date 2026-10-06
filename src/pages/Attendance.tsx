import { useEffect, useMemo, useState } from "react";
import { useCompanyId } from "@/hooks/use-company-id";
import { useActiveCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarCheck, Loader2, Save, CheckCheck } from "lucide-react";

type Status = "present" | "absent" | "late" | "half_day" | "on_leave";

const STATUSES: { value: Status; label: string; cls: string }[] = [
  { value: "present", label: "Present", cls: "bg-success/15 text-success border-success/30" },
  { value: "late", label: "Late", cls: "bg-warning/15 text-warning border-warning/30" },
  { value: "half_day", label: "Half day", cls: "bg-primary/15 text-primary border-primary/30" },
  { value: "on_leave", label: "On leave", cls: "bg-secondary text-foreground border-border" },
  { value: "absent", label: "Absent", cls: "bg-destructive/15 text-destructive border-destructive/30" },
];

interface Row {
  employee_id: string;
  name: string;
  code: string | null;
  status: Status | null;
  check_in: string;
  check_out: string;
  notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const Attendance = () => {
  const companyId = useCompanyId();
  const { canManage } = useActiveCompany();
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!companyId) { setRows([]); setLoading(false); return; }
    setLoading(true);
    const [{ data: emps }, { data: recs }] = await Promise.all([
      supabase.from("employees").select("id, first_name, last_name, employee_code")
        .eq("company_id", companyId).eq("status", "active").order("first_name"),
      supabase.from("attendance_records").select("employee_id, status, check_in, check_out, notes")
        .eq("company_id", companyId).eq("work_date", date),
    ]);
    const map = new Map((recs || []).map(r => [r.employee_id, r]));
    setRows((emps || []).map(e => {
      const r = map.get(e.id);
      return {
        employee_id: e.id,
        name: `${e.first_name} ${e.last_name}`,
        code: e.employee_code,
        status: (r?.status as Status) ?? null,
        check_in: r?.check_in?.slice(0, 5) ?? "",
        check_out: r?.check_out?.slice(0, 5) ?? "",
        notes: r?.notes ?? "",
      };
    }));
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [companyId, date]);

  const update = (id: string, patch: Partial<Row>) =>
    setRows(rs => rs.map(r => (r.employee_id === id ? { ...r, ...patch } : r)));

  const summary = useMemo(() => {
    const s: Record<string, number> = {};
    rows.forEach(r => { if (r.status) s[r.status] = (s[r.status] || 0) + 1; });
    return s;
  }, [rows]);

  const save = async () => {
    if (!companyId) return;
    const marked = rows.filter(r => r.status);
    if (!marked.length) { toast.error("Mark at least one employee first."); return; }
    setSaving(true);
    const { error } = await supabase.from("attendance_records").upsert(
      marked.map(r => ({
        company_id: companyId,
        employee_id: r.employee_id,
        work_date: date,
        status: r.status!,
        check_in: r.check_in || null,
        check_out: r.check_out || null,
        notes: r.notes.trim() || null,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "employee_id,work_date" },
    );
    setSaving(false);
    if (error) { toast.error("Could not save attendance", { description: error.message }); return; }
    toast.success("Attendance saved", { description: `${marked.length} employee(s) for ${date}.` });
    load();
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <div className="eyebrow mb-2">People</div>
        <h1 className="heading-display text-foreground">Attendance</h1>
        <div className="divider-elegant mt-3" />
      </div>

      <GlassCard className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="att-date" className="text-xs">Date</Label>
          <Input id="att-date" type="date" value={date} max={today()} onChange={e => setDate(e.target.value || today())} className="w-48" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <span key={s.value} className={`text-xs px-3 py-1.5 rounded-full border ${s.cls}`}>
              {s.label}: {summary[s.value] || 0}
            </span>
          ))}
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"
              onClick={() => setRows(rs => rs.map(r => ({ ...r, status: r.status ?? "present" })))}>
              <CheckCheck className="h-4 w-4" /> Mark rest present
            </Button>
            <Button size="sm" className="gap-1.5" disabled={saving} onClick={save}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </Button>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-0 overflow-x-auto">
        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading attendance…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <CalendarCheck className="h-8 w-8 mx-auto mb-3 text-primary" />
            No active employees yet. Add employees to start tracking attendance.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground border-b border-border">
                <th className="p-4">Employee</th><th className="p-4">Status</th>
                <th className="p-4">In</th><th className="p-4">Out</th><th className="p-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.employee_id} className="border-b border-border/50">
                  <td className="p-4">
                    <div className="font-medium text-foreground">{r.name}</div>
                    {r.code && <div className="text-xs text-muted-foreground">{r.code}</div>}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {STATUSES.map(s => (
                        <button key={s.value} type="button" disabled={!canManage}
                          aria-pressed={r.status === s.value}
                          onClick={() => update(r.employee_id, { status: s.value })}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                            r.status === s.value ? s.cls : "border-border text-muted-foreground hover:text-foreground"
                          }`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-4"><Input type="time" aria-label={`Check in ${r.name}`} disabled={!canManage} value={r.check_in} onChange={e => update(r.employee_id, { check_in: e.target.value })} className="w-28" /></td>
                  <td className="p-4"><Input type="time" aria-label={`Check out ${r.name}`} disabled={!canManage} value={r.check_out} onChange={e => update(r.employee_id, { check_out: e.target.value })} className="w-28" /></td>
                  <td className="p-4"><Input aria-label={`Notes ${r.name}`} disabled={!canManage} maxLength={200} value={r.notes} onChange={e => update(r.employee_id, { notes: e.target.value })} className="min-w-40" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  );
};

export default Attendance;
