import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Download, Users, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

interface PayrollFile {
  id: string;
  month: number;
  year: number;
  status: string | null;
}

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
  nic?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
  employment_date?: string | null;
}

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
          .select("id, first_name, last_name, nic, bank_name, bank_account, employment_date")
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

  const getEmployeeName = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const filtered = entries.filter(e => {
    if (!search) return true;
    const name = getEmployeeName(e.employee_id).toLowerCase();
    return name.includes(search.toLowerCase());
  });

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
          Download individual or bulk payslips from completed payroll runs.
        </p>
      </div>

      {files.length === 0 ? (
        <GlassCard className="text-center py-16">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No completed payroll runs yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Finalise a payroll run to see payslips here.</p>
        </GlassCard>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Period selector */}
          <GlassCard className="p-0 lg:self-start">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Calendar className="h-4 w-4 text-primary" /> Pay Periods
              </div>
            </div>
            <div className="p-2 max-h-[400px] overflow-auto scrollbar-thin">
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

          {/* Payslips list */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
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

            <GlassCard className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Employee</th>
                      <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Gross</th>
                      <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Deductions</th>
                      <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Net Pay</th>
                      <th className="text-center px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No payslips found.</td></tr>
                    ) : filtered.map(entry => (
                      <tr key={entry.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                          {getEmployeeName(entry.employee_id)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground">
                          {Number(entry.gross_pay).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-destructive">
                          {Number(entry.total_deductions).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-primary">
                          {Number(entry.net_pay).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(entry)}
                            disabled={exporting}
                            className="gap-1.5 text-muted-foreground hover:text-primary"
                          >
                            <FileText className="h-4 w-4" /> PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payslips;
