import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { CheckSquare, Square, Circle } from "lucide-react";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface CheckItem {
  id: string;
  label: string;
  check: () => Promise<boolean>;
}

const Checklist = () => {
  const { companyId } = useAuth();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [results, setResults] = useState<Record<string, boolean | null>>({});
  const [loading, setLoading] = useState(true);

  const items: CheckItem[] = [
    {
      id: "employees",
      label: "Active employees exist",
      check: async () => {
        const { count } = await supabase.from("employees").select("id", { count: "exact", head: true })
          .eq("company_id", companyId!).eq("status", "active");
        return (count ?? 0) > 0;
      },
    },
    {
      id: "components",
      label: "Payroll components configured",
      check: async () => {
        const { count } = await supabase.from("payroll_components").select("id", { count: "exact", head: true })
          .eq("company_id", companyId!).eq("is_active", true);
        return (count ?? 0) > 0;
      },
    },
    {
      id: "working_days",
      label: `Working days set for ${months[month - 1]} ${year}`,
      check: async () => {
        const { count } = await supabase.from("working_day_configs").select("id", { count: "exact", head: true })
          .eq("company_id", companyId!).eq("year", year).eq("month", month);
        return (count ?? 0) > 0;
      },
    },
    {
      id: "holidays",
      label: "Public holidays configured",
      check: async () => {
        const { count } = await supabase.from("public_holidays").select("id", { count: "exact", head: true })
          .eq("company_id", companyId!);
        return (count ?? 0) > 0;
      },
    },
    {
      id: "leaves_reviewed",
      label: "Pending leave requests reviewed",
      check: async () => {
        const { count } = await supabase.from("leave_requests").select("id", { count: "exact", head: true })
          .eq("company_id", companyId!).eq("status", "pending");
        return (count ?? 0) === 0;
      },
    },
    {
      id: "payroll_created",
      label: `Payroll file created for ${months[month - 1]} ${year}`,
      check: async () => {
        const { count } = await supabase.from("payroll_files").select("id", { count: "exact", head: true })
          .eq("company_id", companyId!).eq("year", year).eq("month", month);
        return (count ?? 0) > 0;
      },
    },
    {
      id: "payroll_finalised",
      label: `Payroll finalised for ${months[month - 1]} ${year}`,
      check: async () => {
        const { count } = await supabase.from("payroll_files").select("id", { count: "exact", head: true })
          .eq("company_id", companyId!).eq("year", year).eq("month", month).eq("status", "completed");
        return (count ?? 0) > 0;
      },
    },
    {
      id: "company_setup",
      label: "Company details completed (BRN/ERN)",
      check: async () => {
        const { data } = await supabase.from("companies").select("brn, ern").eq("id", companyId!).maybeSingle();
        return !!(data?.brn && data?.ern);
      },
    },
  ];

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    (async () => {
      const res: Record<string, boolean | null> = {};
      for (const item of items) {
        try {
          res[item.id] = await item.check();
        } catch {
          res[item.id] = null;
        }
      }
      setResults(res);
      setLoading(false);
    })();
  }, [companyId]);

  const doneCount = Object.values(results).filter(v => v === true).length;
  const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <div className="eyebrow mb-2">Monthly Checklist</div>
        <h1 className="heading-display text-foreground">{months[month - 1]} {year} Checklist</h1>
        <div className="divider-elegant mt-3" />
        <p className="text-sm text-muted-foreground mt-3">
          Track your monthly payroll preparation steps. {doneCount}/{items.length} completed.
        </p>
      </div>

      {/* Progress */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-semibold text-primary">{progress}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: "var(--gradient-emerald)" }}
          />
        </div>
      </GlassCard>

      {/* Items */}
      <GlassCard className="p-0 divide-y divide-border">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full" />
          </div>
        ) : (
          items.map(item => {
            const status = results[item.id];
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors">
                {status === true ? (
                  <CheckSquare className="h-5 w-5 text-primary shrink-0" />
                ) : status === false ? (
                  <Square className="h-5 w-5 text-muted-foreground shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                )}
                <span className={`text-sm ${status === true ? "text-foreground" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </div>
            );
          })
        )}
      </GlassCard>
    </div>
  );
};

export default Checklist;
