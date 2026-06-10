import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/use-company-id";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { toast } from "sonner";
import { RefreshCw, Scale } from "lucide-react";

interface Row {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  opening_balance: number;
  accrued: number;
  taken: number;
  closing_balance: number;
  december_payout_days: number;
}

const LeaveBalances = ({ year }: { year: number }) => {
  const companyId = useCompanyId();
  const [rows, setRows] = useState<Row[]>([]);
  const [empMap, setEmpMap] = useState<Record<string, string>>({});
  const [typeMap, setTypeMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const load = async () => {
    if (!companyId) return;
    setLoading(true);
    const [b, e, t] = await Promise.all([
      supabase.from("leave_balances").select("*").eq("company_id", companyId).eq("year", year),
      supabase.from("employees").select("id, first_name, last_name").eq("company_id", companyId),
      supabase.from("leave_types").select("id, name").eq("company_id", companyId),
    ]);
    if (b.error) toast.error(b.error.message);
    setRows((b.data || []) as any);
    setEmpMap(Object.fromEntries((e.data || []).map((x: any) => [x.id, `${x.first_name} ${x.last_name}`])));
    setTypeMap(Object.fromEntries((t.data || []).map((x: any) => [x.id, x.name])));
    setLoading(false);
  };

  useEffect(() => { load(); }, [companyId, year]);

  const recalc = async () => {
    if (!companyId) return;
    setRecalculating(true);
    const { error } = await supabase.rpc("recalculate_company_balances" as any, {
      _company: companyId, _year: year,
    });
    setRecalculating(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Balances recalculated for ${year}`);
    load();
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Leave balances</div>
          <h3 className="font-display text-xl text-foreground flex items-center gap-2 mt-1">
            <Scale className="h-5 w-5 text-primary" /> {year}
          </h3>
        </div>
        <Button onClick={recalc} disabled={recalculating} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${recalculating ? "animate-spin" : ""}`} />
          {recalculating ? "Recalculating..." : "Recalculate"}
        </Button>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No balances yet. Add leave types with annual entitlement and click <b>Recalculate</b>.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 pr-3">Employee</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 px-3 text-right">Opening</th>
                <th className="py-2 px-3 text-right">Accrued</th>
                <th className="py-2 px-3 text-right">Taken</th>
                <th className="py-2 px-3 text-right">Balance</th>
                <th className="py-2 pl-3 text-right">Dec Payout</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-border/40">
                  <td className="py-2 pr-3 text-foreground">{empMap[r.employee_id] || "—"}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{typeMap[r.leave_type_id] || "—"}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{Number(r.opening_balance).toFixed(1)}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{Number(r.accrued).toFixed(1)}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{Number(r.taken).toFixed(1)}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-medium text-primary">{Number(r.closing_balance).toFixed(1)}</td>
                  <td className="py-2 pl-3 text-right tabular-nums text-success">
                    {Number(r.december_payout_days) > 0 ? Number(r.december_payout_days).toFixed(1) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
};

export default LeaveBalances;
