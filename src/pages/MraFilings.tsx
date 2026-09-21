import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyId } from "@/hooks/use-company-id";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import PeriodSelector from "@/components/PeriodSelector";
import MraNoticeAnalyzer from "@/components/MraNoticeAnalyzer";
import { Button } from "@/components/ui/button";
import { BarChart3, FileSpreadsheet, Download, ExternalLink, ShieldCheck } from "lucide-react";

const MRA_PORTAL_URL = "https://eservices.mra.mu";
import * as XLSX from "xlsx";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const getMraDeadline = (month: number, year: number) => {
  const dm = month === 12 ? 1 : month + 1;
  const dy = month === 12 ? year + 1 : year;
  const last = new Date(dy, dm, 0).getDate();
  return `${last} ${months[dm - 1]} ${dy}`;
};

interface EmployeeBreakdown {
  employee_id: string;
  name: string;
  nic: string | null;
  gross: number;
  paye: number;
  csgEmp: number;
  csgEr: number;
  nsfEmp: number;
  nsfEr: number;
  prgfEmp: number;
  prgfEr: number;
  levy: number;
}

interface FilingRow {
  fileId: string;
  month: number;
  year: number;
  status: string | null;
  paye: number;
  csgTotal: number;
  nsfTotal: number;
  prgfTotal: number;
  levy: number;
  totalPayable: number;
  employeeCount: number;
  deadline: string;
  breakdown: EmployeeBreakdown[];
}

const MraFilings = () => {
  const companyId = useCompanyId();
  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [filings, setFilings] = useState<FilingRow[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        supabase.from("companies").select("name, brn, ern, tan").eq("id", companyId).maybeSingle(),
        supabase.from("employees").select("id, first_name, last_name, nic").eq("company_id", companyId),
      ]);
      setCompany(companyRes.data);
      const empMap = new Map((empRes.data || []).map((e: any) => [e.id, e]));
      const files = filesRes.data || [];
      const rows: FilingRow[] = [];

      for (const f of files) {
        const { data: entries } = await supabase.from("payroll_entries")
          .select("employee_id, deductions, gross_pay")
          .eq("payroll_file_id", f.id);
        if (!entries) continue;

        const breakdown: EmployeeBreakdown[] = [];
        let paye = 0, csgEmp = 0, csgEr = 0, nsfEmp = 0, nsfEr = 0, prgfEmp = 0, prgfEr = 0, levy = 0;

        entries.forEach((e: any) => {
          const d = e.deductions || {};
          const emp: any = empMap.get(e.employee_id);
          const gross = Number(e.gross_pay ?? 0);
          // Prefer stored values; fall back to ratios for legacy rows
          const ePaye = Number(d.paye ?? 0);
          const eCsgEmp = Number(d.csg ?? 0);
          const eCsgEr = Number(d.csgEmployer ?? gross * 0.03);
          const eNsfEmp = Number(d.nsf ?? 0);
          const eNsfEr = Number(d.nsfEmployer ?? Math.min(gross, 25000) * 0.015);
          const ePrgfEmp = Number(d.prgf ?? gross * 0.03);
          const ePrgfEr = Number(d.prgfEmployer ?? gross * 0.06);
          const eLevy = Number(d.trainingLevy ?? gross * 0.015);

          paye += ePaye;
          csgEmp += eCsgEmp; csgEr += eCsgEr;
          nsfEmp += eNsfEmp; nsfEr += eNsfEr;
          prgfEmp += ePrgfEmp; prgfEr += ePrgfEr;
          levy += eLevy;

          breakdown.push({
            employee_id: e.employee_id,
            name: emp ? `${emp.first_name} ${emp.last_name}` : "Unknown",
            nic: emp?.nic ?? null,
            gross,
            paye: ePaye,
            csgEmp: eCsgEmp, csgEr: eCsgEr,
            nsfEmp: eNsfEmp, nsfEr: eNsfEr,
            prgfEmp: ePrgfEmp, prgfEr: ePrgfEr,
            levy: eLevy,
          });
        });

        rows.push({
          fileId: f.id,
          month: f.month,
          year: f.year,
          status: f.status,
          paye,
          csgTotal: csgEmp + csgEr,
          nsfTotal: nsfEmp + nsfEr,
          prgfTotal: prgfEmp + prgfEr,
          levy,
          totalPayable: paye + csgEmp + csgEr + nsfEmp + nsfEr + prgfEmp + prgfEr + levy,
          employeeCount: entries.length,
          deadline: getMraDeadline(f.month, f.year),
          breakdown,
        });
      }
      setFilings(rows);
      setLoading(false);
    })();
  }, [companyId]);

  const filteredFilings = filings.filter(r => r.month === selMonth && r.year === selYear);

  const fileName = (row: FilingRow, kind: string) =>
    `${kind}_${row.year}-${String(row.month).padStart(2, "0")}.csv`;

  const downloadCsv = (filename: string, rows: (string | number)[][]) => {
    const csv = rows.map(r => r.map(c => {
      const s = String(c ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPaye = (row: FilingRow) => {
    // MRA PAYE / CSG / NSF Monthly Return — placeholder layout (replace once
    // user uploads the official MRA template).
    const header = [
      "Company", company?.name ?? "",
      "BRN", company?.brn ?? "",
      "TAN", company?.tan ?? "",
      "ERN", company?.ern ?? "",
      "Period", `${months[row.month - 1]} ${row.year}`,
    ];
    const data: (string | number)[][] = [
      header,
      [],
      ["NIC", "Employee Name", "Gross Emoluments (MUR)", "PAYE (MUR)", "CSG Emp (MUR)", "CSG Er (MUR)", "NSF Emp (MUR)", "NSF Er (MUR)"],
      ...row.breakdown.map(b => [
        b.nic ?? "",
        b.name,
        b.gross.toFixed(2),
        b.paye.toFixed(2),
        b.csgEmp.toFixed(2),
        b.csgEr.toFixed(2),
        b.nsfEmp.toFixed(2),
        b.nsfEr.toFixed(2),
      ]),
      [],
      ["TOTAL", "", row.breakdown.reduce((s, b) => s + b.gross, 0).toFixed(2),
        row.paye.toFixed(2),
        row.breakdown.reduce((s, b) => s + b.csgEmp, 0).toFixed(2),
        row.breakdown.reduce((s, b) => s + b.csgEr, 0).toFixed(2),
        row.breakdown.reduce((s, b) => s + b.nsfEmp, 0).toFixed(2),
        row.breakdown.reduce((s, b) => s + b.nsfEr, 0).toFixed(2),
      ],
    ];
    downloadCsv(fileName(row, "PAYE_CSG_NSF_Return"), data);
  };

  const exportPrgf = (row: FilingRow) => {
    const header = [
      "Company", company?.name ?? "",
      "BRN", company?.brn ?? "",
      "TAN", company?.tan ?? "",
      "Period", `${months[row.month - 1]} ${row.year}`,
    ];
    const data: (string | number)[][] = [
      header,
      [],
      ["NIC", "Employee Name", "Gross Emoluments (MUR)", "PRGF Employee (3%)", "PRGF Employer (6%)", "Total PRGF (MUR)"],
      ...row.breakdown.map(b => [
        b.nic ?? "",
        b.name,
        b.gross.toFixed(2),
        b.prgfEmp.toFixed(2),
        b.prgfEr.toFixed(2),
        (b.prgfEmp + b.prgfEr).toFixed(2),
      ]),
      [],
      ["TOTAL", "", row.breakdown.reduce((s, b) => s + b.gross, 0).toFixed(2),
        row.breakdown.reduce((s, b) => s + b.prgfEmp, 0).toFixed(2),
        row.breakdown.reduce((s, b) => s + b.prgfEr, 0).toFixed(2),
        row.prgfTotal.toFixed(2),
      ],
    ];
    downloadCsv(fileName(row, "PRGF_Return"), data);
  };

  const exportSummary = (row: FilingRow) => {
    const wb = XLSX.utils.book_new();
    const data = [
      ["MRA Monthly Filing Summary"],
      ["Company", company?.name ?? ""],
      ["BRN", company?.brn ?? ""],
      ["TAN", company?.tan ?? ""],
      ["ERN", company?.ern ?? ""],
      ["Period", `${months[row.month - 1]} ${row.year}`],
      ["Filing Deadline", row.deadline],
      ["Employees", row.employeeCount],
      [],
      ["Contribution", "Amount (MUR)"],
      ["PAYE (Income Tax)", row.paye],
      ["CSG (Employee + Employer)", row.csgTotal],
      ["NSF (Employee + Employer)", row.nsfTotal],
      ["PRGF (Employee + Employer)", row.prgfTotal],
      ["HRDC Training Levy", row.levy],
      [],
      ["Total Payable to MRA", row.totalPayable],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 32 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
    XLSX.writeFile(wb, `MRA_Filing_${row.year}-${String(row.month).padStart(2, "0")}.xlsx`);
  };

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
        <div className="eyebrow mb-2">MRA Filings</div>
        <h1 className="heading-display text-foreground">Statutory Returns</h1>
        <div className="divider-elegant mt-3" />
        <p className="text-sm text-muted-foreground mt-3">
          Export PAYE / CSG / NSF and PRGF returns in MRA-ready format for monthly filing.
        </p>
      </div>

      <PeriodSelector
        month={selMonth}
        year={selYear}
        onChange={(m, y) => { setSelMonth(m); setSelYear(y); }}
        badge={`Filing Deadline: ${getMraDeadline(selMonth, selYear)}`}
      />

      {/* MRA Portal */}
      <GlassCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-foreground">File your returns on the MRA Portal</div>
              <div className="text-xs text-muted-foreground mt-1">
                Download your returns below, then sign in to the Mauritius Revenue Authority e-services portal to submit
                PAYE / CSG / NSF / PRGF for {months[selMonth - 1]} {selYear}. Deadline: {getMraDeadline(selMonth, selYear)}.
              </div>
            </div>
          </div>
          <Button
            size="sm"
            className="gap-1.5 shrink-0"
            style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}
            onClick={() => window.open(MRA_PORTAL_URL, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="h-3.5 w-3.5" /> Log in to MRA Portal
          </Button>
        </div>
      </GlassCard>

      {filteredFilings.length === 0 ? (
        <GlassCard className="text-center py-16">
          <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No completed payroll run for {months[selMonth - 1]} {selYear}.</p>
        </GlassCard>
      ) : filteredFilings.map(row => (
        <div key={row.fileId} className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "PAYE", value: row.paye },
              { label: "CSG", value: row.csgTotal },
              { label: "NSF", value: row.nsfTotal },
              { label: "PRGF", value: row.prgfTotal },
              { label: "Total Payable", value: row.totalPayable, accent: true },
            ].map(c => (
              <GlassCard key={c.label} className="p-4">
                <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">{c.label}</div>
                <div className={`mt-1 font-display text-lg tabular-nums ${c.accent ? "text-primary" : "text-foreground"}`}>
                  {c.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Export actions */}
          <GlassCard>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-foreground">Download Returns</div>
                <div className="text-xs text-muted-foreground">Generate MRA-format files for {months[row.month - 1]} {row.year}.</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => exportPaye(row)} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> PAYE / CSG / NSF Return
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportPrgf(row)} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> PRGF Return
                </Button>
                <Button size="sm" onClick={() => exportSummary(row)} className="gap-1.5"
                  style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Summary (XLSX)
                </Button>
                <Button size="sm" onClick={() => window.open(MRA_PORTAL_URL, "_blank", "noopener,noreferrer")} className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" /> File on MRA Portal
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* AI notice check */}
          <MraNoticeAnalyzer
            period={`${months[row.month - 1]} ${row.year}`}
            company={company}
            totals={{
              "Gross emoluments": row.breakdown.reduce((s, b) => s + b.gross, 0),
              PAYE: row.paye,
              "CSG (employee + employer)": row.csgTotal,
              "NSF (employee + employer)": row.nsfTotal,
              "PRGF (employee + employer)": row.prgfTotal,
              "HRDC training levy": row.levy,
              "Total payable to MRA": row.totalPayable,
            }}
            employees={row.breakdown.map(b => ({
              name: b.name,
              nic: b.nic,
              gross: b.gross,
              paye: b.paye,
              csg: b.csgEmp + b.csgEr,
              nsf: b.nsfEmp + b.nsfEr,
              prgf: b.prgfEmp + b.prgfEr,
            }))}
          />

          {/* Employee breakdown */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    {["Employee", "NIC", "Gross", "PAYE", "CSG (E+R)", "NSF (E+R)", "PRGF (E+R)"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {row.breakdown.map(b => (
                    <tr key={b.employee_id} className="border-b border-border/40 hover:bg-secondary/20">
                      <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">{b.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{b.nic ?? "—"}</td>
                      <td className="px-4 py-2.5 tabular-nums text-foreground">{b.gross.toLocaleString()}</td>
                      <td className="px-4 py-2.5 tabular-nums text-foreground">{b.paye.toLocaleString()}</td>
                      <td className="px-4 py-2.5 tabular-nums text-foreground">{(b.csgEmp + b.csgEr).toLocaleString()}</td>
                      <td className="px-4 py-2.5 tabular-nums text-foreground">{(b.nsfEmp + b.nsfEr).toLocaleString()}</td>
                      <td className="px-4 py-2.5 tabular-nums text-foreground">{(b.prgfEmp + b.prgfEr).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-primary/5">
                    <td className="px-4 py-3 font-bold text-foreground" colSpan={2}>TOTAL</td>
                    <td className="px-4 py-3 tabular-nums font-bold">{row.breakdown.reduce((s, b) => s + b.gross, 0).toLocaleString()}</td>
                    <td className="px-4 py-3 tabular-nums font-bold">{row.paye.toLocaleString()}</td>
                    <td className="px-4 py-3 tabular-nums font-bold">{row.csgTotal.toLocaleString()}</td>
                    <td className="px-4 py-3 tabular-nums font-bold">{row.nsfTotal.toLocaleString()}</td>
                    <td className="px-4 py-3 tabular-nums font-bold text-primary">{row.prgfTotal.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      ))}
    </div>
  );
};

export default MraFilings;
