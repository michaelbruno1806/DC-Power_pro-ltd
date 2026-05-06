import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import PeriodSelector from "@/components/PeriodSelector";
import { Button } from "@/components/ui/button";
import { BarChart3, FileSpreadsheet } from "lucide-react";
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

interface FilingRow {
  month: number;
  year: number;
  status: string | null;
  paye: number;
  csgTotal: number;
  nsfTotal: number;
  levy: number;
  totalPayable: number;
  employeeCount: number;
  deadline: string;
}

const MraFilings = () => {
  const { companyId } = useAuth();
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
      const [filesRes, companyRes] = await Promise.all([
        supabase.from("payroll_files").select("id, month, year, status")
          .eq("company_id", companyId)
          .in("status", ["completed", "approved"])
          .order("year", { ascending: false })
          .order("month", { ascending: false }),
        supabase.from("companies").select("name, brn, ern").eq("id", companyId).maybeSingle(),
      ]);
      setCompany(companyRes.data);
      const files = filesRes.data || [];
      const rows: FilingRow[] = [];

      for (const f of files) {
        const { data: entries } = await supabase.from("payroll_entries")
          .select("deductions, gross_pay")
          .eq("payroll_file_id", f.id);
        if (!entries) continue;

        let paye = 0, csgEmp = 0, nsfEmp = 0;
        entries.forEach((e: any) => {
          const d = e.deductions || {};
          paye += Number(d.paye ?? 0);
          csgEmp += Number(d.csg ?? 0);
          nsfEmp += Number(d.nsf ?? 0);
        });
        const totalGross = entries.reduce((s: number, e: any) => s + Number(e.gross_pay ?? 0), 0);
        const csgEmployer = totalGross * 0.06;
        const nsfEmployer = totalGross * 0.025;
        const levy = totalGross * 0.015;

        rows.push({
          month: f.month,
          year: f.year,
          status: f.status,
          paye,
          csgTotal: csgEmp + csgEmployer,
          nsfTotal: nsfEmp + nsfEmployer,
          levy,
          totalPayable: paye + csgEmp + csgEmployer + nsfEmp + nsfEmployer + levy,
          employeeCount: entries.length,
          deadline: getMraDeadline(f.month, f.year),
        });
      }
      setFilings(rows);
      setLoading(false);
    })();
  }, [companyId]);

  // Filter filings to selected month/year
  const filteredFilings = filings.filter(r => r.month === selMonth && r.year === selYear);
  const allFilingsForDisplay = filteredFilings.length > 0 ? filteredFilings : [];

  const exportMra = (row: FilingRow) => {
    const wb = XLSX.utils.book_new();
    const data = [
      ["MRA Monthly Filing Summary"],
      ["Company", company?.name ?? ""],
      ["BRN", company?.brn ?? ""],
      ["ERN", company?.ern ?? ""],
      ["Period", `${months[row.month - 1]} ${row.year}`],
      ["Filing Deadline", row.deadline],
      ["Employees", row.employeeCount],
      [],
      ["Contribution", "Amount (MUR)"],
      ["PAYE (Income Tax)", row.paye],
      ["CSG (Employee + Employer)", row.csgTotal],
      ["NSF (Employee + Employer)", row.nsfTotal],
      ["HRDC Training Levy", row.levy],
      [],
      ["Total Payable to MRA", row.totalPayable],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, "MRA Filing");
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
          View and export MRA monthly filing summaries for PAYE, CSG, NSF, and HRDC Levy.
        </p>
      </div>

      {/* Period Selector */}
      <PeriodSelector
        month={selMonth}
        year={selYear}
        onChange={(m, y) => { setSelMonth(m); setSelYear(y); }}
        badge={`Filing Deadline: ${getMraDeadline(selMonth, selYear)}`}
      />

      {allFilingsForDisplay.length === 0 ? (
        <GlassCard className="text-center py-16">
          <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No completed payroll run for {months[selMonth - 1]} {selYear}.</p>
        </GlassCard>
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-secondary/20">
                  {["Period", "Deadline", "Employees", "PAYE", "CSG", "NSF", "HRDC Levy", "Total", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFilingsForDisplay.map(row => (
                  <tr key={`${row.year}-${row.month}`} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {months[row.month - 1]} {row.year}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                      {row.deadline}
                    </td>
                    <td className="px-4 py-3 text-foreground tabular-nums">{row.employeeCount}</td>
                    <td className="px-4 py-3 text-foreground tabular-nums">{row.paye.toLocaleString()}</td>
                    <td className="px-4 py-3 text-foreground tabular-nums">{row.csgTotal.toLocaleString()}</td>
                    <td className="px-4 py-3 text-foreground tabular-nums">{row.nsfTotal.toLocaleString()}</td>
                    <td className="px-4 py-3 text-foreground tabular-nums">{row.levy.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-primary tabular-nums">{row.totalPayable.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => exportMra(row)} className="gap-1.5 text-muted-foreground hover:text-primary">
                        <FileSpreadsheet className="h-4 w-4" /> Export
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default MraFilings;
