import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyId } from "@/hooks/use-company-id";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Palmtree, CheckCircle2, XCircle, Clock, Trash2, Settings2 } from "lucide-react";
import PeriodSelector from "@/components/PeriodSelector";

interface LeaveType {
  id: string;
  name: string;
  code: string | null;
  is_paid: boolean;
  annual_entitlement_days: number | null;
  is_active: boolean;
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string | null;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  reason: string | null;
}

interface Employee { id: string; first_name: string; last_name: string; }

const leaveSchema = z.object({
  employee_id: z.string().uuid({ message: "Select an employee" }),
  leave_type_id: z.string().uuid({ message: "Select a leave type" }),
  start_date: z.string().min(1, "Start date required"),
  end_date: z.string().min(1, "End date required"),
  reason: z.string().trim().max(500, "Reason too long").optional(),
}).refine(d => d.end_date >= d.start_date, {
  message: "End date must be on/after start date", path: ["end_date"],
});

const typeSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(50),
  code: z.string().trim().max(10).optional(),
  is_paid: z.boolean(),
  annual_entitlement_days: z.number().min(0).max(365).optional().nullable(),
});

const calcDays = (start: string, end: string) => {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000) + 1);
};

const Leaves = () => {
  const { user } = useAuth();
  const companyId = useCompanyId();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [typesOpen, setTypesOpen] = useState(false);
  const [form, setForm] = useState({
    employee_id: "", leave_type_id: "", start_date: "", end_date: "", reason: "",
  });
  const [typeForm, setTypeForm] = useState({ name: "", code: "", is_paid: true, annual_entitlement_days: "" });

  const fetchAll = async () => {
    if (!companyId) return;
    setLoading(true);
    const [r, t, e] = await Promise.all([
      supabase.from("leave_requests").select("*").eq("company_id", companyId).order("start_date", { ascending: false }),
      supabase.from("leave_types").select("*").eq("company_id", companyId).order("name"),
      supabase.from("employees").select("id, first_name, last_name").eq("company_id", companyId).order("first_name"),
    ]);
    if (r.data) setRequests(r.data as any);
    if (t.data) setTypes(t.data as any);
    if (e.data) setEmployees(e.data as any);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [companyId]);

  const submit = async () => {
    if (!companyId) return;
    const parsed = leaveSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const days = calcDays(form.start_date, form.end_date);
    const { error } = await supabase.from("leave_requests").insert({
      company_id: companyId,
      employee_id: form.employee_id,
      leave_type_id: form.leave_type_id,
      start_date: form.start_date,
      end_date: form.end_date,
      days,
      reason: form.reason || null,
      status: "pending",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Leave request created");
    setOpen(false);
    setForm({ employee_id: "", leave_type_id: "", start_date: "", end_date: "", reason: "" });
    fetchAll();
  };

  const decide = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("leave_requests")
      .update({ status, approved_by: user?.id, decided_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Leave ${status}`); fetchAll(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this leave request?")) return;
    const { error } = await supabase.from("leave_requests").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetchAll(); }
  };

  const saveType = async () => {
    if (!companyId) return;
    const parsed = typeSchema.safeParse({
      ...typeForm,
      annual_entitlement_days: typeForm.annual_entitlement_days ? Number(typeForm.annual_entitlement_days) : null,
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const { error } = await supabase.from("leave_types").insert({
      company_id: companyId,
      name: typeForm.name.trim(),
      code: typeForm.code.trim() || null,
      is_paid: typeForm.is_paid,
      annual_entitlement_days: typeForm.annual_entitlement_days ? Number(typeForm.annual_entitlement_days) : null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Leave type added");
    setTypeForm({ name: "", code: "", is_paid: true, annual_entitlement_days: "" });
    fetchAll();
  };

  const removeType = async (id: string) => {
    if (!confirm("Delete this leave type?")) return;
    const { error } = await supabase.from("leave_types").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetchAll(); }
  };

  const empName = (id: string) => {
    const e = employees.find(x => x.id === id); return e ? `${e.first_name} ${e.last_name}` : "—";
  };
  const typeOf = (id: string | null) => types.find(t => t.id === id);

  // Filter requests by selected period (overlap)
  const filteredRequests = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const pStart = `${selYear}-${pad(selMonth)}-01`;
    const lastDay = new Date(selYear, selMonth, 0).getDate();
    const pEnd = `${selYear}-${pad(selMonth)}-${pad(lastDay)}`;
    return requests.filter(r => r.start_date <= pEnd && r.end_date >= pStart);
  }, [requests, selMonth, selYear]);

  const stats = useMemo(() => ({
    pending: filteredRequests.filter(r => r.status === "pending").length,
    approved: filteredRequests.filter(r => r.status === "approved").length,
    rejected: filteredRequests.filter(r => r.status === "rejected").length,
  }), [filteredRequests]);

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-2">People</div>
          <h1 className="heading-display text-foreground flex items-center gap-3">
            <Palmtree className="h-7 w-7 text-primary" /> Leaves
          </h1>
          <div className="divider-elegant mt-3" />
          <p className="text-sm text-muted-foreground mt-3">
            Track and approve employee leave requests. Approved unpaid leaves automatically feed into payroll.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={typesOpen} onOpenChange={setTypesOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><Settings2 className="h-4 w-4" /> Leave Types</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display text-2xl font-medium">Manage Leave Types</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-4">
                {types.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/40 border border-border">
                    <div>
                      <div className="text-sm font-medium text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.code || "—"} · {t.is_paid ? "Paid" : "Unpaid"}
                        {t.annual_entitlement_days ? ` · ${t.annual_entitlement_days} days/yr` : ""}
                      </div>
                    </div>
                    <button onClick={() => removeType(t.id)} className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 mt-5 space-y-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Add new</div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Name (e.g. Annual)" value={typeForm.name} onChange={e => setTypeForm({...typeForm, name: e.target.value})} className="bg-secondary/40" />
                  <Input placeholder="Code (optional)" value={typeForm.code} onChange={e => setTypeForm({...typeForm, code: e.target.value})} className="bg-secondary/40" />
                  <Select value={typeForm.is_paid ? "paid" : "unpaid"} onValueChange={v => setTypeForm({...typeForm, is_paid: v === "paid"})}>
                    <SelectTrigger className="bg-secondary/40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid (deducts from salary)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Annual days (optional)" value={typeForm.annual_entitlement_days} onChange={e => setTypeForm({...typeForm, annual_entitlement_days: e.target.value})} className="bg-secondary/40" />
                </div>
                <Button onClick={saveType} className="w-full" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>Add Leave Type</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-11 px-5" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
                <Plus className="h-4 w-4" /> New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg">
              <DialogHeader><DialogTitle className="font-display text-2xl font-medium">New Leave Request</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Employee *</Label>
                  <Select value={form.employee_id} onValueChange={v => setForm({...form, employee_id: v})}>
                    <SelectTrigger className="bg-secondary/40"><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Leave Type *</Label>
                  <Select value={form.leave_type_id} onValueChange={v => setForm({...form, leave_type_id: v})}>
                    <SelectTrigger className="bg-secondary/40"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {types.filter(t => t.is_active).map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name} {!t.is_paid && "(Unpaid)"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="bg-secondary/40" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="bg-secondary/40" />
                  </div>
                </div>
                {form.start_date && form.end_date && (
                  <div className="text-xs text-muted-foreground">Duration: <span className="text-foreground font-medium">{calcDays(form.start_date, form.end_date)} day(s)</span></div>
                )}
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="bg-secondary/40" rows={3} maxLength={500} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>Submit</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <PeriodSelector
        month={selMonth}
        year={selYear}
        onChange={(m, y) => { setSelMonth(m); setSelYear(y); }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-warning" },
          { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-success" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-destructive" },
        ].map(s => (
          <GlassCard key={s.label} className="hover:border-primary/30">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <div className="font-display text-3xl font-semibold text-foreground">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                {["Employee","Type","Period","Days","Status","Reason",""].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">No leave requests for this period</td></tr>
              ) : filteredRequests.map(r => {
                const t = typeOf(r.leave_type_id);
                return (
                  <tr key={r.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">{empName(r.employee_id)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {t?.name || "—"} {t && !t.is_paid && <span className="text-[10px] uppercase tracking-wider text-warning">· Unpaid</span>}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{r.start_date} → {r.end_date}</td>
                    <td className="px-5 py-3.5 text-foreground tabular-nums">{r.days}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded ${
                        r.status === "approved" ? "bg-success/10 text-success" :
                        r.status === "rejected" ? "bg-destructive/10 text-destructive" :
                        r.status === "cancelled" ? "bg-muted text-muted-foreground" :
                        "bg-warning/10 text-warning"
                      }`}>{r.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs max-w-[200px] truncate">{r.reason || "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        {r.status === "pending" && (
                          <>
                            <button onClick={() => decide(r.id, "approved")} title="Approve" className="p-1.5 rounded-md hover:bg-success/10 text-muted-foreground hover:text-success transition-colors">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => decide(r.id, "rejected")} title="Reject" className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => remove(r.id)} title="Delete" className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default Leaves;
