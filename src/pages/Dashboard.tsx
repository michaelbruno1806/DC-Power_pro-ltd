import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import ChecklistRing from "@/components/ChecklistRing";
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

const now = new Date();
const currentMonth = monthNames[now.getMonth()];
const currentYear = now.getFullYear();
const doneCount = checklist.filter(c => c.done).length;

const Dashboard = () => {
  const { displayName, companyId } = useAuth();
  const firstName = displayName ? displayName.split(" ")[0] : "";

  const [employeeCount, setEmployeeCount] = useState(0);
  const [payrollTrend, setPayrollTrend] = useState<{ month: string; net: number; gross: number }[]>([]);
  const [latestPayroll, setLatestPayroll] = useState<{ totalNet: number; totalGross: number; totalDeductions: number } | null>(null);
  const [leaveData, setLeaveData] = useState<{ name: string; type: string; dates: string; days: number; status: string }[]>([]);

  useEffect(() => {
    if (!companyId) return;
    loadDashboardData();
  }, [companyId]);

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

      const latest = files[files.length - 1];
      setLatestPayroll({
        totalNet: Number(latest.total_net) || 0,
        totalGross: Number(latest.total_gross) || 0,
        totalDeductions: Number(latest.total_deductions) || 0,
      });
    }

    // Recent leave requests
    const { data: leaves } = await supabase
      .from("leave_requests")
      .select("employee_id, start_date, end_date, days, status, leave_type_id")
      .eq("company_id", companyId!)
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
    }
  };

  const formatMUR = (v: number) => `MUR ${v.toLocaleString()}`;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-2">{currentMonth} {currentYear} · Overview</div>
          <h1 className="heading-display text-foreground">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <div className="divider-elegant mt-3" />
        </div>
      </div>

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
              {latestPayroll ? "Payroll processed for this period" : "No payroll data yet — create your first payroll file"}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Period: 1 {currentMonth} – {new Date(currentYear, now.getMonth() + 1, 0).getDate()} {currentMonth} {currentYear}
            </div>
            <div className="flex gap-2 mt-5 flex-wrap">
              <span className="inline-flex gap-2 items-center bg-success/10 text-success border border-success/20 rounded-full px-3 py-1.5 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> On track
              </span>
              <span className="inline-flex gap-2 items-center bg-secondary/50 border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> Filing due 20 {monthNames[(now.getMonth() + 1) % 12]}
              </span>
            </div>
          </div>
          <div
            className="h-16 w-16 rounded-lg flex items-center justify-center font-display font-semibold text-lg text-primary-foreground shrink-0"
            style={{ background: "var(--gradient-emerald)", boxShadow: "var(--shadow-glow)" }}
          >
            DC
          </div>
        </div>
      </GlassCard>

      {/* Key Numbers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-section text-foreground">Key Numbers</h2>
          <span className="text-xs text-muted-foreground">Current period</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Net Pay", value: latestPayroll ? formatMUR(latestPayroll.totalNet) : "—", sub: "Total net payroll", icon: DollarSign, trend: "up" as const },
            { label: "Active Employees", value: String(employeeCount), sub: "Currently active", icon: Users, trend: "up" as const },
            { label: "Gross Pay", value: latestPayroll ? formatMUR(latestPayroll.totalGross) : "—", sub: "Total gross payroll", icon: FileText, trend: "neutral" as const },
            { label: "Deductions", value: latestPayroll ? formatMUR(latestPayroll.totalDeductions) : "—", sub: "PAYE + CSG/NSF + Levy", icon: AlertTriangle, trend: "down" as const },
          ].map((card) => (
            <GlassCard key={card.label} className="group hover:-translate-y-0.5 hover:border-primary/30">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <card.icon className="h-4 w-4 text-primary" />
                </div>
                {card.trend === "up" && <TrendingUp className="h-4 w-4 text-success" />}
                {card.trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
              </div>
              <div className="font-display text-3xl font-semibold text-foreground tracking-wide">{card.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">{card.label}</div>
              <div className="text-[11px] text-muted-foreground/80 mt-1">{card.sub}</div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Charts */}
      {payrollTrend.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <GlassCard>
            <h3 className="heading-section text-foreground mb-1">Payroll Trend</h3>
            <p className="text-xs text-muted-foreground mb-5">Net pay over recent months</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={payrollTrend}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(220, 8%, 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(220, 8%, 65%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(220, 15%, 9%)", border: "1px solid hsl(220, 12%, 18%)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`MUR ${v.toLocaleString()}`, "Net Pay"]}
                />
                <Area type="monotone" dataKey="net" stroke="hsl(142, 76%, 45%)" fill="url(#netGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h3 className="heading-section text-foreground mb-1">Gross vs Deductions</h3>
            <p className="text-xs text-muted-foreground mb-5">Monthly comparison</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(220, 8%, 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(220, 8%, 65%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(220, 15%, 9%)", border: "1px solid hsl(220, 12%, 18%)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`MUR ${v.toLocaleString()}`]}
                />
                <Bar dataKey="gross" fill="hsl(142, 76%, 45%)" radius={[4, 4, 0, 0]} name="Gross" />
                <Bar dataKey="net" fill="hsl(142, 70%, 55%)" radius={[4, 4, 0, 0]} opacity={0.6} name="Net" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      )}

      {/* Checklist + Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <h3 className="heading-section text-foreground mb-1">Checklist Summary</h3>
          <p className="text-xs text-muted-foreground mb-5">Your monthly payroll checklist</p>
          <div className="flex gap-6 items-start">
            <ChecklistRing done={doneCount} total={5} />
            <div className="flex-1 space-y-2">
              {checklist.map((item, i) => (
                <div key={item.label} className="flex items-center justify-between gap-2 bg-secondary/30 border border-border/60 rounded-md px-3 py-2.5">
                  <div className="flex gap-2.5 items-center">
                    <span className={`h-1.5 w-1.5 rounded-full ${item.done ? "bg-success" : "bg-destructive"}`} />
                    <span className="text-sm font-medium text-foreground">{i + 1}. {item.label}</span>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.done ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  }`}>
                    {item.done ? "Done" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="heading-section text-foreground mb-1">Recent Leaves</h3>
          <p className="text-xs text-muted-foreground mb-5">Latest leave requests</p>
          <div className="space-y-2">
            {leaveData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No leave requests yet.</p>
            ) : (
              leaveData.map((row, i) => (
                <div key={i} className="bg-secondary/30 border border-border/60 rounded-md px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{row.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{row.type} · {row.days} days</div>
                  </div>
                  <span className={`inline-flex gap-1.5 items-center text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded ${
                    row.status === "Approved" ? "bg-success/10 text-success" : row.status === "Pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${row.status === "Approved" ? "bg-success" : row.status === "Pending" ? "bg-warning" : "bg-destructive"}`} />
                    {row.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
