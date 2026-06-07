import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileText, Download, Eye, Search, Calendar, Mail, MapPin, Building2 } from "lucide-react";
import {
  generatePayslipPDF,
  generateBulkPayslipPDF,
  type CompanyInfo,
  type PayslipPayload,
} from "@/lib/payroll/exports";
import type { PayrollResult } from "@/lib/payroll/calc";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface PayrollFile { id: string; month: number; year: number; status: string | null }
interface EntryRow {
  id: string;
  employee_id: string;
  basic_salary: number;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  additions: any;
  deductions: any;
}
interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  job_title?: string | null;
  department?: string | null;
  nic?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
  employment_date?: string | null;
}

const initials = (e: Employee) =>
  `${e.first_name?.[0] ?? ""}${e.last_name?.[0] ?? ""}`.toUpperCase();

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Payslips = () => {
  const { companyId } = useAuth();
  const [files, setFiles] = useState<PayrollFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<PayrollFile | null>(null);
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [previewEntry, setPreviewEntry] = useState<EntryRow | null>(null);

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      setLoading(true);
      const [filesRes, companyRes, empRes] = await Promise.all([
        supabase.from("payroll_files").select("id, month, year, status")
          .eq("company_id", companyId)
          .in("status", ["completed", "approved"])
          .order("year", { ascending: false })
          .order("month", { ascending: false }),
        supabase.from("companies").select("name, address, city, brn, ern, phone, email")
          .eq("id", companyId).maybeSingle(),
        supabase.from("employees")
          .select("id, first_name, last_name, job_title, department, nic, bank_name, bank_account, employment_date")
          .eq("company_id", companyId),
      ]);
      setFiles((filesRes.data || []) as PayrollFile[]);
      setCompany((companyRes.data as CompanyInfo) || null);
      setEmployees((empRes.data || []) as Employee[]);
      if (filesRes.data && filesRes.data.length > 0) {
        const first = filesRes.data[0] as PayrollFile;
        setSelectedFile(first);
        await loadEntries(first.id);
      }
      setLoading(false);
    })();
  }, [companyId]);

  const loadEntries = async (fileId: string) => {
    const { data } = await supabase.from("payroll_entries").select("*").eq("payroll_file_id", fileId);
    setEntries((data || []) as EntryRow[]);
  };

  const selectFile = async (f: PayrollFile) => {
    setSelectedFile(f);
    setPreviewEntry(null);
    await loadEntries(f.id);
  };

  const buildPayslipPayload = (entry: EntryRow): PayslipPayload | null => {
    const emp = employees.find(e => e.id === entry.employee_id);
    if (!emp || !company || !selectedFile) return null;
    const adds = entry.additions || {};
    const deds = entry.deductions || {};
    const additionsList = adds.list || [];
    const deductionsList = deds.list || [];
    const grossPay = Number(entry.gross_pay);
    const result: PayrollResult = {
      basicSalary: Number(entry.basic_salary),
      unpaidLeaveDeduction: 0,
      overtimePay: Number(adds.overtimePay ?? 0),
      additions: additionsList,
      totalAdditions: additionsList.reduce((s: number, a: any) => s + Number(a.amount ?? 0), 0),
      grossPay,
      taxableIncome: grossPay,
      wageBill: grossPay,
      paye: Number(deds.paye ?? 0),
      csgEmployee: Number(deds.csg ?? 0),
      nsfEmployee: Number(deds.nsf ?? 0),
      prgfEmployee: Number(deds.prgf ?? 0),
      prgfEmployer: Number(deds.prgfEmployer ?? 0),
      customDeductions: deductionsList,
      totalCustomDeductions: deductionsList.reduce((s: number, d: any) => s + Number(d.amount ?? 0), 0),
      totalEmployeeDeductions: Number(entry.total_deductions),
      netPay: Number(entry.net_pay),
      csgEmployer: 0,
      nsfEmployer: 0,
      trainingLevyEmployer: 0,
      employerCost: 0,
    };
    return {
      company,
      employee: {
        first_name: emp.first_name,
        last_name: emp.last_name,
        nic: emp.nic,
        bank_name: emp.bank_name,
        bank_account: emp.bank_account,
        employment_date: emp.employment_date,
      },
      month: selectedFile.month,
      year: selectedFile.year,
      result,
    };
  };

  const handleDownload = async (entry: EntryRow) => {
    const payload = buildPayslipPayload(entry);
    if (!payload) return;
    setExporting(true);
    try {
      await generatePayslipPDF(payload);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate payslip");
    } finally {
      setExporting(false);
    }
  };

  const handleBulkDownload = async () => {
    if (!selectedFile) return;
    const payloads = entries.map(e => buildPayslipPayload(e)).filter(Boolean) as PayslipPayload[];
    if (payloads.length === 0) { toast.error("No payslips to download"); return; }
    setExporting(true);
    try {
      await generateBulkPayslipPDF(payloads);
      toast.success(`Downloaded ${payloads.length} payslips`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate payslips");
    } finally {
      setExporting(false);
    }
  };

  const getEmployee = (id: string) => employees.find(e => e.id === id);

  const filtered = useMemo(() => entries.filter(e => {
    if (!search) return true;
    const emp = getEmployee(e.employee_id);
    const name = emp ? `${emp.first_name} ${emp.last_name}`.toLowerCase() : "";
    return name.includes(search.toLowerCase());
  }), [entries, search, employees]);

  const previewPayload = previewEntry ? buildPayslipPayload(previewEntry) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <div className="eyebrow mb-2">Payslips</div>
        <h1 className="heading-display text-foreground">Payslip Archive</h1>
        <div className="divider-elegant mt-3" />
        <p className="text-sm text-muted-foreground mt-3">
          Browse payslips by employee. Click any card to preview or download a branded PDF.
        </p>
      </div>

      {files.length === 0 ? (
        <GlassCard className="text-center py-16">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No completed payroll runs yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Finalise a payroll run to see payslips here.</p>
        </GlassCard>
      ) : (
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Period selector */}
          <GlassCard className="p-0 lg:self-start">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Calendar className="h-4 w-4 text-primary" /> Pay Periods
              </div>
            </div>
            <div className="p-2 max-h-[500px] overflow-auto scrollbar-thin">
              {files.map(f => (
                <button
                  key={f.id}
                  onClick={() => selectFile(f)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                    selectedFile?.id === f.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  {months[f.month - 1]} {f.year}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Card grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employee..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 bg-secondary/40 border-border"
                />
              </div>
              <Button
                onClick={handleBulkDownload}
                disabled={exporting || entries.length === 0}
                className="gap-2 shrink-0"
                style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}
              >
                <Download className="h-4 w-4" /> Download All ({entries.length})
              </Button>
            </div>

            {filtered.length === 0 ? (
              <GlassCard className="text-center py-12">
                <p className="text-sm text-muted-foreground">No payslips match your search.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(entry => {
                  const emp = getEmployee(entry.employee_id);
                  if (!emp) return null;
                  return (
                    <GlassCard
                      key={entry.id}
                      className="group p-0 overflow-hidden cursor-pointer transition-all hover:border-primary/40 hover:shadow-[0_0_24px_hsl(var(--primary)/0.15)]"
                    >
                      <div
                        onClick={() => setPreviewEntry(entry)}
                        className="p-5 space-y-4"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="h-11 w-11 rounded-full flex items-center justify-center font-display font-semibold text-sm text-primary-foreground shrink-0"
                            style={{ background: "var(--gradient-emerald)" }}
                          >
                            {initials(emp)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-foreground truncate">
                              {emp.first_name} {emp.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {emp.job_title || emp.department || "—"}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Gross</div>
                            <div className="font-medium text-foreground tabular-nums">{fmt(Number(entry.gross_pay))}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Deductions</div>
                            <div className="font-medium text-destructive tabular-nums">{fmt(Number(entry.total_deductions))}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Net</div>
                            <div className="font-semibold text-primary tabular-nums">{fmt(Number(entry.net_pay))}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center border-t border-border/60 bg-secondary/20">
                        <button
                          onClick={() => setPreviewEntry(entry)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        <div className="h-5 w-px bg-border" />
                        <button
                          onClick={() => handleDownload(entry)}
                          disabled={exporting}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
                        </button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!previewEntry} onOpenChange={(o) => !o && setPreviewEntry(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Payslip preview</DialogTitle>
          </DialogHeader>
          {previewPayload && (
            <PayslipPreview
              payload={previewPayload}
              onDownload={() => previewEntry && handleDownload(previewEntry)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PayslipPreview = ({ payload, onDownload }: { payload: PayslipPayload; onDownload: () => void }) => {
  const { company, employee, month, year, result } = payload;
  const period = `${months[month - 1]} ${year}`;
  return (
    <div className="bg-white text-neutral-900">
      {/* Header band */}
      <div className="bg-[#0a0a0a] text-white px-8 py-6 border-b-2 border-[#d4af37]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-2xl font-bold">{company.name}</div>
            <div className="text-xs text-neutral-300 mt-1 space-y-0.5">
              {(company.address || company.city) && (
                <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{[company.address, company.city].filter(Boolean).join(", ")}</div>
              )}
              {company.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{company.email}</div>}
              {(company.brn || company.ern) && (
                <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3" />
                  {company.brn && <span>BRN: {company.brn}</span>}
                  {company.ern && <span className="ml-2">ERN: {company.ern}</span>}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[#d4af37] font-bold text-sm tracking-wider">PAYSLIP</div>
            <div className="text-xs text-neutral-300 mt-1">{period.toUpperCase()}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Issued {new Date().toLocaleDateString("en-GB")}</div>
          </div>
        </div>
      </div>

      {/* Employee block */}
      <div className="px-8 py-5 grid grid-cols-2 gap-6 border-b border-neutral-200">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Employee</div>
          <div className="text-base font-semibold mt-1">{employee.first_name} {employee.last_name}</div>
          {employee.nic && <div className="text-xs text-neutral-600 mt-0.5">NIC: {employee.nic}</div>}
          {employee.bank_name && (
            <div className="text-xs text-neutral-600 mt-0.5">
              {employee.bank_name}{employee.bank_account ? ` · ${employee.bank_account}` : ""}
            </div>
          )}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Pay Period</div>
          <div className="text-base font-semibold mt-1">{period}</div>
          {employee.employment_date && (
            <div className="text-xs text-neutral-600 mt-0.5">Joined {employee.employment_date}</div>
          )}
        </div>
      </div>

      {/* Earnings + Deductions */}
      <div className="px-8 py-5 grid md:grid-cols-2 gap-6">
        <div>
          <div className="bg-neutral-900 text-[#d4af37] px-3 py-2 text-xs font-bold uppercase tracking-wider">Earnings</div>
          <table className="w-full text-sm">
            <tbody>
              <Row label="Basic Salary" amount={result.basicSalary} />
              {result.additions.map((a, i) => <Row key={i} label={a.name} amount={a.amount} />)}
              {result.unpaidLeaveDeduction > 0 && (
                <Row label="Unpaid Leave" amount={-result.unpaidLeaveDeduction} negative />
              )}
            </tbody>
          </table>
        </div>
        <div>
          <div className="bg-neutral-900 text-[#d4af37] px-3 py-2 text-xs font-bold uppercase tracking-wider">Deductions</div>
          <table className="w-full text-sm">
            <tbody>
              {result.paye > 0 && <Row label="PAYE (Income Tax)" amount={result.paye} negative />}
              {result.csgEmployee > 0 && <Row label="CSG (employee)" amount={result.csgEmployee} negative />}
              {result.nsfEmployee > 0 && <Row label="NSF (employee)" amount={result.nsfEmployee} negative />}
              {result.prgfEmployee > 0 && <Row label="PRGF (employee)" amount={result.prgfEmployee} negative />}
              {result.customDeductions.map((d, i) => <Row key={i} label={d.name} amount={d.amount} negative />)}
              {result.paye + result.csgEmployee + result.nsfEmployee + result.prgfEmployee + result.totalCustomDeductions === 0 && (
                <Row label="—" amount={0} />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="px-8 pb-5">
        <div className="grid grid-cols-3 gap-4 py-3 border-t border-neutral-200">
          <Total label="Gross Pay" value={result.grossPay} />
          <Total label="Total Deductions" value={result.totalEmployeeDeductions} accent="text-red-700" />
          <div />
        </div>
        <div
          className="mt-2 rounded-md px-4 py-4 flex items-center justify-between"
          style={{ background: "#d4af37" }}
        >
          <div className="text-[#0a0a0a] text-xs font-bold uppercase tracking-wider">Net Pay</div>
          <div className="text-[#0a0a0a] text-2xl font-bold tabular-nums">MUR {fmt(result.netPay)}</div>
        </div>
      </div>

      {/* Footer + Actions */}
      <div className="px-8 pb-6 pt-2 border-t border-neutral-200">
        <p className="text-[10px] text-neutral-500 text-center">
          System-generated payslip · Mauritius PAYE / CSG / NSF / PRGF / HRDC compliant · No signature required
        </p>
        <div className="flex justify-center mt-4">
          <Button onClick={onDownload} className="gap-2" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, amount, negative }: { label: string; amount: number; negative?: boolean }) => (
  <tr className="border-b border-neutral-100 last:border-0">
    <td className="py-2 text-neutral-700">{label}</td>
    <td className={`py-2 text-right tabular-nums ${negative ? "text-red-700" : "text-neutral-900"}`}>
      {negative && amount > 0 ? "− " : ""}MUR {fmt(Math.abs(amount))}
    </td>
  </tr>
);

const Total = ({ label, value, accent = "text-neutral-900" }: { label: string; value: number; accent?: string }) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">{label}</div>
    <div className={`font-semibold tabular-nums ${accent}`}>MUR {fmt(value)}</div>
  </div>
);

export default Payslips;
