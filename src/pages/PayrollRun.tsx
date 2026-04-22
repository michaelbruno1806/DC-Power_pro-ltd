import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Calculator, CheckCircle2, Users, RefreshCw,
  FileSpreadsheet, FileDown, FileText, ChevronDown,
} from "lucide-react";
import {
  calculatePayroll,
  aggregatePayrollTotals,
  type PayrollComponent,
  type PayrollResult,
} from "@/lib/payroll/calc";
import {
  generatePayslipPDF,
  generateBulkPayslipPDF,
  generatePayrollExcel,
  generatePayrollCSV,
  type CompanyInfo,
  type PayslipPayload,
  type PayrollExportRow,
} from "@/lib/payroll/exports";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface PayrollFile {
  id: string;
  month: number;
  year: number;
  status: string | null;
  total_gross: number | null;
  total_deductions: number | null;
  total_net: number | null;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  basic_salary: number | null;
  status: string | null;
  nic?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
  employment_date?: string | null;
}

interface ComponentRow {
  id: string;
  name: string;
  type: string; // "addition" | "deduction"
  amount: number | null;
  is_percentage: boolean | null;
  taxable: boolean | null;
  in_wage_bill: boolean | null;
  is_active: boolean | null;
}

/** Per-employee inputs the user can tweak in the UI. */
interface EntryDraft {
  employeeId: string;
  basic: number;
  unpaidLeaveDays: number;
  overtime1_5x: number;
  overtime2x: number;
  bonus: number;
  loan: number;
}

const PayrollRun = () => {
  const { id: payrollFileId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companyId } = useAuth();

  const [file, setFile] = useState<PayrollFile | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, EntryDraft>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!payrollFileId || !companyId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const [fileRes, companyRes, empRes, compRes, entryRes] = await Promise.all([
        supabase.from("payroll_files").select("*").eq("id", payrollFileId).maybeSingle(),
        supabase.from("companies").select("name, address, city, brn, ern, phone, email")
          .eq("id", companyId).maybeSingle(),
        supabase.from("employees")
          .select("id, first_name, last_name, basic_salary, status, nic, bank_name, bank_account, employment_date")
          .eq("company_id", companyId).eq("status", "active")
          .order("first_name", { ascending: true }),
        supabase.from("payroll_components").select("*")
          .eq("company_id", companyId).eq("is_active", true),
        supabase.from("payroll_entries").select("*").eq("payroll_file_id", payrollFileId),
      ]);

      if (cancelled) return;
      if (fileRes.error) toast.error(fileRes.error.message);
      if (empRes.error) toast.error(empRes.error.message);
      if (compRes.error) toast.error(compRes.error.message);

      setFile(fileRes.data as PayrollFile | null);
      setCompany((companyRes.data as CompanyInfo) || null);
      const emps = (empRes.data || []) as Employee[];
      setEmployees(emps);
      setComponents((compRes.data || []) as ComponentRow[]);

      // Hydrate drafts from existing entries (or seed from employee basic).
      const existing = new Map<string, any>();
      (entryRes.data || []).forEach((e: any) => existing.set(e.employee_id, e));

      const seed: Record<string, EntryDraft> = {};
      for (const e of emps) {
        const prev = existing.get(e.id);
        const adds = (prev?.additions as any) || {};
        const deds = (prev?.deductions as any) || {};
        seed[e.id] = {
          employeeId: e.id,
          basic: Number(prev?.basic_salary ?? e.basic_salary ?? 0),
          unpaidLeaveDays: Number(adds.unpaidLeaveDays ?? 0),
          overtime1_5x: Number(adds.overtime1_5x ?? 0),
          overtime2x: Number(adds.overtime2x ?? 0),
          bonus: Number(adds.bonus ?? 0),
          loan: Number(deds.loan ?? 0),
        };
      }
      setDrafts(seed);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [payrollFileId, companyId]);

  // ── Compute (memoised, runs on every keystroke) ───────────────────────
  const companyAdditions = useMemo<PayrollComponent[]>(
    () => components
      .filter(c => c.type === "addition")
      .map(c => ({
        name: c.name,
        amount: Number(c.amount ?? 0),
        isPercentage: !!c.is_percentage,
        taxable: c.taxable ?? true,
        inWageBill: c.in_wage_bill ?? true,
      })),
    [components],
  );
  const companyDeductions = useMemo<PayrollComponent[]>(
    () => components
      .filter(c => c.type === "deduction")
      .map(c => ({
        name: c.name,
        amount: Number(c.amount ?? 0),
        isPercentage: !!c.is_percentage,
      })),
    [components],
  );

  const computed: Record<string, PayrollResult> = useMemo(() => {
    const out: Record<string, PayrollResult> = {};
    for (const e of employees) {
      const d = drafts[e.id];
      if (!d) continue;
      const additions: PayrollComponent[] = [...companyAdditions];
      if (d.bonus > 0) additions.push({ name: "Bonus", amount: d.bonus, taxable: true, inWageBill: true });
      const deductions: PayrollComponent[] = [...companyDeductions];
      if (d.loan > 0) deductions.push({ name: "Loan / Advance", amount: d.loan });

      out[e.id] = calculatePayroll({
        basicSalary: d.basic,
        unpaidLeaveDays: d.unpaidLeaveDays,
        overtimeHours1_5x: d.overtime1_5x,
        overtimeHours2x: d.overtime2x,
        additions,
        deductions,
      });
    }
    return out;
  }, [employees, drafts, companyAdditions, companyDeductions]);

  const totals = useMemo(
    () => aggregatePayrollTotals(Object.values(computed)),
    [computed],
  );

  // ── Updaters ──────────────────────────────────────────────────────────
  const updateDraft = (empId: string, patch: Partial<EntryDraft>) => {
    setDrafts(prev => ({ ...prev, [empId]: { ...prev[empId], ...patch } }));
  };

  // ── Persist ───────────────────────────────────────────────────────────
  const saveAll = async (markStatus?: "draft" | "processing" | "completed") => {
    if (!payrollFileId) return;
    setSaving(true);
    try {
      // Upsert all entries
      const rows = employees.map(e => {
        const d = drafts[e.id];
        const r = computed[e.id];
        if (!d || !r) return null;
        return {
          payroll_file_id: payrollFileId,
          employee_id: e.id,
          basic_salary: r.basicSalary,
          gross_pay: r.grossPay,
          total_deductions: r.totalEmployeeDeductions,
          net_pay: r.netPay,
          additions: {
            unpaidLeaveDays: d.unpaidLeaveDays,
            overtime1_5x: d.overtime1_5x,
            overtime2x: d.overtime2x,
            bonus: d.bonus,
            overtimePay: r.overtimePay,
            list: r.additions,
          },
          deductions: {
            loan: d.loan,
            paye: r.paye,
            csg: r.csgEmployee,
            nsf: r.nsfEmployee,
            list: r.customDeductions,
          },
        };
      }).filter(Boolean) as any[];

      // Wipe + reinsert (simpler than upsert; safe per RLS scope of this file)
      const { error: delErr } = await supabase
        .from("payroll_entries").delete().eq("payroll_file_id", payrollFileId);
      if (delErr) throw delErr;

      if (rows.length > 0) {
        const { error: insErr } = await supabase.from("payroll_entries").insert(rows);
        if (insErr) throw insErr;
      }

      const { error: updErr } = await supabase
        .from("payroll_files")
        .update({
          total_gross: totals.totalGross,
          total_deductions: totals.totalDeductions,
          total_net: totals.totalNet,
          ...(markStatus ? { status: markStatus } : {}),
        })
        .eq("id", payrollFileId);
      if (updErr) throw updErr;

      toast.success(markStatus === "completed" ? "Payroll finalised" : "Payroll saved");
      if (markStatus) setFile(prev => prev ? { ...prev, status: markStatus } : prev);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save payroll");
    } finally {
      setSaving(false);
    }
  };

  // ── Export helpers ────────────────────────────────────────────────────
  const buildExportRows = (): PayrollExportRow[] =>
    employees.map(e => {
      const r = computed[e.id]; const d = drafts[e.id];
      if (!r || !d) return null;
      return {
        employee: `${e.first_name} ${e.last_name}`,
        nic: e.nic,
        basic: r.basicSalary,
        unpaidLeaveDays: d.unpaidLeaveDays,
        overtime: r.overtimePay,
        bonus: d.bonus,
        gross: r.grossPay,
        paye: r.paye,
        csgEmployee: r.csgEmployee,
        nsfEmployee: r.nsfEmployee,
        loan: d.loan,
        totalDeductions: r.totalEmployeeDeductions,
        netPay: r.netPay,
        csgEmployer: r.csgEmployer,
        nsfEmployer: r.nsfEmployer,
        trainingLevy: r.trainingLevyEmployer,
        employerCost: r.employerCost,
      } as PayrollExportRow;
    }).filter(Boolean) as PayrollExportRow[];

  const requireCompany = (): boolean => {
    if (!company || !file) {
      toast.error("Missing company or payroll info");
      return false;
    }
    return true;
  };

  const handleExportCSV = () => {
    if (!requireCompany()) return;
    generatePayrollCSV({ company: company!, month: file!.month, year: file!.year, rows: buildExportRows() });
  };

  const handleExportExcel = () => {
    if (!requireCompany()) return;
    generatePayrollExcel({ company: company!, month: file!.month, year: file!.year, rows: buildExportRows() });
  };

  const buildPayslipPayloads = (): PayslipPayload[] =>
    employees.map(e => {
      const r = computed[e.id];
      if (!r || !file || !company) return null;
      return {
        company,
        employee: {
          first_name: e.first_name, last_name: e.last_name,
          nic: e.nic, bank_name: e.bank_name, bank_account: e.bank_account,
          employment_date: e.employment_date,
        },
        month: file.month, year: file.year, result: r,
      } as PayslipPayload;
    }).filter(Boolean) as PayslipPayload[];

  const handleSinglePayslip = async (employeeId: string) => {
    if (!requireCompany()) return;
    const e = employees.find(x => x.id === employeeId);
    const r = computed[employeeId];
    if (!e || !r) return;
    setExporting(true);
    try {
      await generatePayslipPDF({
        company: company!,
        employee: { first_name: e.first_name, last_name: e.last_name, nic: e.nic, bank_name: e.bank_name, bank_account: e.bank_account, employment_date: e.employment_date },
        month: file!.month, year: file!.year, result: r,
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate payslip");
    } finally {
      setExporting(false);
    }
  };

  const handleBulkPayslips = async () => {
    if (!requireCompany()) return;
    const payloads = buildPayslipPayloads();
    if (payloads.length === 0) { toast.error("No employees to export"); return; }
    setExporting(true);
    try {
      await generateBulkPayslipPDF(payloads);
      toast.success(`Generated ${payloads.length} payslips`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate payslips");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  if (!file) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Payroll file not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/payroll")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const isFinalised = file.status === "completed" || file.status === "approved";

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate("/payroll")}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mb-3"
          >
            <ArrowLeft className="h-3 w-3" /> Payroll Files
          </button>
          <div className="eyebrow mb-2">Payroll Run</div>
          <h1 className="heading-display text-foreground">
            {months[file.month - 1]} {file.year}
          </h1>
          <div className="divider-elegant mt-3" />
          <p className="text-sm text-muted-foreground mt-3">
            {employees.length} active employees · status:{" "}
            <span className="text-foreground font-medium">{file.status || "draft"}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={exporting}>
                <FileDown className="h-4 w-4" /> Export <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBulkPayslips} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" /> All Payslips (PDF)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" disabled={saving || isFinalised} onClick={() => saveAll("draft")} className="gap-2">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </Button>
          <Button
            disabled={saving || isFinalised}
            onClick={() => saveAll("completed")}
            className="gap-2"
            style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}
          >
            <CheckCircle2 className="h-4 w-4" /> Finalise Payroll
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Gross", value: totals.totalGross, icon: Calculator, color: "text-foreground" },
          { label: "Total Deductions", value: totals.totalDeductions, icon: Users, color: "text-destructive" },
          { label: "Total Net", value: totals.totalNet, icon: CheckCircle2, color: "text-primary" },
          { label: "Employer Cost", value: totals.totalEmployerCost, icon: Calculator, color: "text-foreground" },
        ].map(s => (
          <GlassCard key={s.label} className="hover:border-primary/30">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className={`font-display text-xl font-semibold truncate ${s.color}`}>
                  MUR {s.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">
                  {s.label}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* MRA breakdown */}
      <GlassCard className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <Stat label="PAYE (employees)" value={totals.totalPAYE} />
          <Stat label="CSG (total)" value={totals.totalCSG} />
          <Stat label="NSF (total)" value={totals.totalNSF} />
          <Stat label="HRDC Levy (employer)" value={totals.totalTrainingLevy} />
        </div>
      </GlassCard>

      {/* Employee table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                {["Employee","Basic","Unpaid Days","OT 1.5x (h)","OT 2x (h)","Bonus","Loan","Gross","Deductions","Net Pay",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={11} className="px-5 py-12 text-center text-muted-foreground">
                  No active employees. Add some in the Employees page first.
                </td></tr>
              ) : employees.map(e => {
                const d = drafts[e.id];
                const r = computed[e.id];
                if (!d || !r) return null;
                return (
                  <tr key={e.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">
                      {e.first_name} {e.last_name}
                    </td>
                    <NumCell value={d.basic} disabled={isFinalised}
                      onChange={v => updateDraft(e.id, { basic: v })} />
                    <NumCell value={d.unpaidLeaveDays} disabled={isFinalised}
                      onChange={v => updateDraft(e.id, { unpaidLeaveDays: v })} />
                    <NumCell value={d.overtime1_5x} disabled={isFinalised}
                      onChange={v => updateDraft(e.id, { overtime1_5x: v })} />
                    <NumCell value={d.overtime2x} disabled={isFinalised}
                      onChange={v => updateDraft(e.id, { overtime2x: v })} />
                    <NumCell value={d.bonus} disabled={isFinalised}
                      onChange={v => updateDraft(e.id, { bonus: v })} />
                    <NumCell value={d.loan} disabled={isFinalised}
                      onChange={v => updateDraft(e.id, { loan: v })} />
                    <td className="px-4 py-2.5 text-foreground tabular-nums whitespace-nowrap">
                      {r.grossPay.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-destructive tabular-nums whitespace-nowrap">
                      {r.totalEmployeeDeductions.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-primary tabular-nums whitespace-nowrap">
                      {r.netPay.toLocaleString()}
                    </td>
                    <td className="px-2 py-2.5">
                      <button
                        onClick={() => handleSinglePayslip(e.id)}
                        disabled={exporting}
                        title="Download payslip"
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <p className="text-[11px] text-muted-foreground/70 text-center">
        Calculations use Mauritian PAYE / CSG / NSF / HRDC Levy rules.
        All values auto-update as you type. Save Draft to persist, Finalise to lock.
      </p>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    <div className="font-display text-lg font-semibold text-foreground mt-1 tabular-nums">
      MUR {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
    </div>
  </div>
);

const NumCell = ({
  value, onChange, disabled,
}: { value: number; onChange: (v: number) => void; disabled?: boolean }) => (
  <td className="px-2 py-1.5">
    <Input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      disabled={disabled}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="h-8 w-24 bg-secondary/40 border-border text-right tabular-nums text-xs"
    />
  </td>
);

export default PayrollRun;
