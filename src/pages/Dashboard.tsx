import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import TrialBanner from "@/components/TrialBanner";
import ChecklistRing from "@/components/ChecklistRing";
import PeriodSelector from "@/components/PeriodSelector";
import { TrendingUp, TrendingDown, Users, Calendar, FileText, AlertTriangle, ArrowRight, DollarSign } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const monthsShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const checklist = [
  { label: "Payroll", done: true },
  { label: "Payslips", done: true },
  { label: "Filing (MRA)", done: false },
  { label: "Payment sent to MRA", done: false },
  { label: "Payment received by MRA", done: false },
];

const doneCount = checklist.filter(c => c.done).length;

/** MRA filing deadline: end of the month following the payroll month */
const getMraDeadline = (month: number, year: number) => {
  const deadlineMonth = month === 12 ? 1 : month + 1;
  const deadlineYear = month === 12 ? year + 1 : year;
  const lastDay = new Date(deadlineYear, deadlineMonth, 0).getDate();
  return `${lastDay} ${monthNames[deadlineMonth - 1]} ${deadlineYear}`;
};

const Dashboard = () => {
  const { displayName, companyId } = useAuth();
  const firstName = displayName ? displayName.split(" ")[0] : "";

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [employeeCount, setEmployeeCount] = useState(0);
  const [payrollTrend, setPayrollTrend] = useState<{ month: string; net: number; gross: number }[]>([]);
  const [latestPayroll, setLatestPayroll] = useState<{ totalNet: number; totalGross: number; totalDeductions: number } | null>(null);
  const [leaveData, setLeaveData] = useState<{ name: string; type: string; dates: string; days: number; status: string }[]>([]);

  useEffect(() => {
    if (!companyId) return;
    loadDashboardData();
  }, [companyId, month, year]);

  const loadDashboardData = async () => {
    // Employee count
    const { count } = await supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId!)
      .eq("status", "active");
    setEmployeeCount(count || 0);

    // Payroll files for trend (last 6 months)
    const { data: files } = await supabase
      .from("payroll_files")
      .select("month, year, total_net, total_gross, total_deductions, status")
      .eq("company_id", companyId!)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(6);

    if (files && files.length > 0) {
      const trend = files.reverse().map(f => ({
        month: monthsShort[f.month - 1],
        net: Number(f.total_net) || 0,
        gross: Number(f.total_gross) || 0,
      }));
      setPayrollTrend(trend);

      // Find payroll for the selected month
      const selectedFile = files.find(f => f.month === month && f.year === year);
      if (selectedFile) {
        setLatestPayroll({
          totalNet: Number(selectedFile.total_net) || 0,
          totalGross: Number(selectedFile.total_gross) || 0,
          totalDeductions: Number(selectedFile.total_deductions) || 0,
        });
      } else {
        setLatestPayroll(null);
      }
    } else {
      setPayrollTrend([]);
      setLatestPayroll(null);
    }

    // Recent leave requests for selected period
    const pad = (n: number) => String(n).padStart(2, "0");
    const startDate = `${year}-${pad(month)}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${pad(month)}-${pad(lastDay)}`;

    const { data: leaves } = await supabase
      .from("leave_requests")
      .select("employee_id, start_date, end_date, days, status, leave_type_id")
      .eq("company_id", companyId!)
      .lte("start_date", endDate)
      .gte("end_date", startDate)
      .order("created_at", { ascending: false })
      .limit(4);

    if (leaves && leaves.length > 0) {
      const empIds = [...new Set(leaves.map(l => l.employee_id))];
      const ltIds = [...new Set(leaves.map(l => l.leave_type_id).filter(Boolean))];

      const { data: emps } = await supabase.from("employees").select("id, first_name, last_name").in("id", empIds);
      const { data: lts } = ltIds.length > 0
        ? await supabase.from("leave_types").select("id, name").in("id", ltIds)
        : { data: [] };

      const empMap = new Map((emps || []).map(e => [e.id, `${e.first_name} ${e.last_name}`]));
      const ltMap = new Map((lts || []).map(lt => [lt.id, lt.name]));

      setLeaveData(leaves.map(l => ({
        name: empMap.get(l.employee_id) || "Employee",
        type: (l.leave_type_id ? ltMap.get(l.leave_type_id) : "Leave") || "Leave",
        dates: `${l.start_date} – ${l.end_date}`,
        days: Number(l.days),
        status: l.status.charAt(0).toUpperCase() + l.status.slice(1),
      })));
    } else {
      setLeaveData([]);
    }
  };

  const formatMUR = (v: number) => `MUR ${v.toLocaleString()}`;
  const lastDayOfMonth = new Date(year, month, 0).getDate();

  return (
    <div className="space-y-8 animate-fade-up">
      <TrialBanner />
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-2">{monthNames[month - 1]} {year} · Overview</div>
          <h1 className="heading-display text-foreground">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <div className="divider-elegant mt-3" />
        </div>
      </div>

      {/* Period Selector */}
      <PeriodSelector
        month={month}
        year={year}
        onChange={(m, y) => { setMonth(m); setYear(y); }}
        badge={`MRA Deadline: ${getMraDeadline(month, year)}`}
      />

      {/* Payroll Assistant */}
      <GlassCard elevated className="relative overflow-hidden border-primary/20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start justify-between gap-6">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-4 border border-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Payroll Assistant
            </span>
            <div className="font-display text-2xl text-foreground">
              {latestPayroll ? "Payroll processed for this period" : "No payroll data yet for this period"}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Period: 1 {monthNames[month - 1]} – {lastDayOfMonth} {monthNames[month - 1]} {year}
            </div>
            <div className="flex gap-2 mt-5 flex-wrap">
              <span className="inline-flex gap-2 items-center bg-success/10 text-success border border-success/20 rounded-full px-3 py-1.5 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> {latestPayroll ? "On track" : "Pending"}
              </span>
              <span className="inline-flex gap-2 items-center bg-secondary/50 border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> Filing due {getMraDeadline(month, year)}
              </span>
            </div>
          </div>
          <div
            className="h-16 w-16 rounded-lg flex items-center justify-center font-display font-semibold text-lg text-primary-foreground shrink-0"
            style={{ background: "var(--gradient-emerald)", boxShadow: "var(--shadow-glow)" }}
          >
            {monthsShort[month - 1]}
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Employees", value: String(employeeCount), icon: Users, trend: null },
          { label: "Gross Pay", value: latestPayroll ? formatMUR(latestPayroll.totalGross) : "—", icon: DollarSign, trend: null },
          { label: "Total Deductions", value: latestPayroll ? formatMUR(latestPayroll.totalDeductions) : "—", icon: TrendingDown, trend: null },
          { label: "Net Pay", value: latestPayroll ? formatMUR(latestPayroll.totalNet) : "—", icon: TrendingUp, trend: null },
        ].map(card => (
          <GlassCard key={card.label} className="relative group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{card.label}</span>
              <card.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="font-display text-2xl text-foreground leading-tight">{card.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Charts */}
      {payrollTrend.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">Net Pay Trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={payrollTrend}>
                <defs>
                  <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={70} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(v: number) => [formatMUR(v), "Net Pay"]}
                />
                <Area type="monotone" dataKey="net" stroke="hsl(var(--primary))" fill="url(#gNet)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">Gross vs Net</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={payrollTrend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={70} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(v: number, name: string) => [formatMUR(v), name === "gross" ? "Gross" : "Net"]}
                />
                <Bar dataKey="gross" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checklist Ring */}
        <GlassCard>
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">Monthly Checklist</div>
          <div className="flex items-center gap-6">
            <ChecklistRing done={doneCount} total={checklist.length} size={80} />
            <div className="space-y-2">
              {checklist.map(c => (
                <div key={c.label} className={`flex items-center gap-2 text-sm ${c.done ? "text-foreground" : "text-muted-foreground"}`}>
                  {c.done ? <span className="h-2 w-2 rounded-full bg-primary" /> : <span className="h-2 w-2 rounded-full bg-border" />}
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Recent leaves */}
        <GlassCard>
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">Leave Requests — {monthNames[month - 1]}</div>
          {leaveData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No leave requests for this period.</p>
          ) : (
            <div className="space-y-3">
              {leaveData.map((l, i) => (
                <div key={i} className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <div className="font-medium text-foreground">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.type} · {l.dates}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground tabular-nums">{l.days}d</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${
                      l.status === "Approved" ? "bg-success/10 text-success" :
                      l.status === "Rejected" ? "bg-destructive/10 text-destructive" :
                      "bg-warning/10 text-warning"
                    }`}>{l.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
