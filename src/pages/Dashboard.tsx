import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/GlassCard";
import ChecklistRing from "@/components/ChecklistRing";
import { TrendingUp, TrendingDown, Users, Calendar, FileText, AlertTriangle, ArrowRight, DollarSign } from "lucide-react";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const checklist = [
  { label: "Payroll", done: true },
  { label: "Payslips", done: true },
  { label: "Filing (MRA)", done: false },
  { label: "Payment sent to MRA", done: false },
  { label: "Payment received by MRA", done: false },
];

const leaveData = [
  { name: "Alice Martin", type: "Annual", dates: "1 Jul – 5 Jul", days: 5, status: "Approved" },
  { name: "Bob Chen", type: "Sick", dates: "10 Jul – 11 Jul", days: 2, status: "Pending" },
];

const openItems = [
  { period: "Jun 2025", item: "MRA Filing", due: "20 Jul", status: "Overdue" },
];

const now = new Date();
const currentMonth = months[now.getMonth()];
const currentYear = now.getFullYear();
const doneCount = checklist.filter(c => c.done).length;

const Dashboard = () => {
  const { displayName } = useAuth();
  const firstName = displayName ? displayName.split(" ")[0] : "";

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
        <div className="flex items-center gap-2">
          <select className="premium-card px-4 py-2 text-sm text-foreground bg-secondary/40">
            <option>DC Power Pro Ltd</option>
          </select>
          <select className="premium-card px-4 py-2 text-sm text-foreground bg-secondary/40">
            {months.map((m, i) => (
              <option key={m} selected={i === now.getMonth()}>{m}</option>
            ))}
          </select>
          <select className="premium-card px-4 py-2 text-sm text-foreground bg-secondary/40">
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} selected={y === currentYear}>{y}</option>
            ))}
          </select>
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
            <div className="font-display text-2xl text-foreground">MRA filing is pending for this period</div>
            <div className="text-sm text-muted-foreground mt-2">
              Period: 1 {currentMonth} – {new Date(currentYear, now.getMonth() + 1, 0).getDate()} {currentMonth} {currentYear}
            </div>
            <div className="flex gap-2 mt-5 flex-wrap">
              <span className="inline-flex gap-2 items-center bg-success/10 text-success border border-success/20 rounded-full px-3 py-1.5 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> On track
              </span>
              <span className="inline-flex gap-2 items-center bg-secondary/50 border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> Filing due 30 {months[(now.getMonth() + 1) % 12]}
              </span>
              <button
                className="inline-flex gap-1.5 items-center rounded-full px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                style={{ background: "var(--gradient-emerald)" }}
              >
                Next: File MRA returns <ArrowRight className="h-3 w-3" />
              </button>
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
          <span className="text-xs text-muted-foreground">vs. last month</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Net Pay", value: "MUR 245,800", sub: "+12% vs last month", icon: DollarSign, trend: "up" },
            { label: "Active Employees", value: "24", sub: "2 new this month", icon: Users, trend: "up" },
            { label: "Checklist Pending", value: String(5 - doneCount), sub: "Items needing action", icon: AlertTriangle, trend: "down" },
            { label: "MRA Payment", value: "MUR 38,420", sub: "PAYE + CSG/NSF + Levy", icon: FileText, trend: "neutral" },
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
          <h3 className="heading-section text-foreground mb-1">Leaves</h3>
          <p className="text-xs text-muted-foreground mb-5">{currentMonth} {currentYear}</p>
          <div className="space-y-2">
            {leaveData.map((row, i) => (
              <div key={i} className="bg-secondary/30 border border-border/60 rounded-md px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">{row.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{row.type} · {row.dates} · {row.days} days</div>
                </div>
                <span className={`inline-flex gap-1.5 items-center text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded ${
                  row.status === "Approved" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${row.status === "Approved" ? "bg-success" : "bg-warning"}`} />
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Open Items */}
      <GlassCard>
        <h3 className="heading-section text-foreground mb-1">Open Items</h3>
        <p className="text-xs text-muted-foreground mb-5">Items from previous periods needing attention</p>
        {openItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">All caught up — nothing pending.</p>
        ) : (
          <div className="space-y-2">
            {openItems.map((row, i) => (
              <div key={i} className="bg-secondary/30 border border-border/60 rounded-md px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <span className="text-sm font-medium text-foreground w-20">{row.period}</span>
                  <span className="text-sm text-muted-foreground">{row.item}</span>
                  <span className="text-sm text-muted-foreground">Due: {row.due}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive bg-destructive/10 px-2.5 py-1 rounded">{row.status}</span>
                  <button className="text-xs font-medium text-primary link-subtle">Resolve</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <div className="text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground pt-4">
        © {currentYear} DC Payroll · All rights reserved
      </div>
    </div>
  );
};

export default Dashboard;
