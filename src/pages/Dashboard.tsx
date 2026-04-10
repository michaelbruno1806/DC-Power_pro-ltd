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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back{displayName ? `, ${displayName.split(' ')[0]}` : ""}</h1>
          <p className="text-sm text-muted-foreground">{currentMonth} {currentYear} — Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="glass rounded-xl px-3 py-2 text-sm text-foreground">
            <option>DC Power Pro Ltd</option>
          </select>
          <select className="glass rounded-xl px-3 py-2 text-sm text-foreground">
            {months.map((m, i) => (
              <option key={m} selected={i === now.getMonth()}>{m}</option>
            ))}
          </select>
          <select className="glass rounded-xl px-3 py-2 text-sm text-foreground">
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} selected={y === currentYear}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Payroll Assistant */}
      <GlassCard elevated className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 bg-primary/15 text-primary font-semibold text-xs px-3 py-1.5 rounded-full mb-3">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Payroll Assistant
            </span>
            <div className="text-foreground font-medium mt-1">MRA filing is pending for this period.</div>
            <div className="text-sm text-muted-foreground mt-1">
              Period: 1 {currentMonth} – {new Date(currentYear, now.getMonth() + 1, 0).getDate()} {currentMonth} {currentYear}
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="inline-flex gap-2 items-center glass rounded-full px-3 py-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-success" /> On track
              </span>
              <span className="inline-flex gap-2 items-center glass rounded-full px-3 py-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> Filing due on 30 {months[(now.getMonth() + 1) % 12]}
              </span>
              <button className="inline-flex gap-1.5 items-center bg-primary/10 text-primary rounded-full px-3 py-1.5 text-xs font-medium hover:bg-primary/20 transition-colors">
                Next: File MRA returns <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="flex gap-3 items-center shrink-0">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-lg text-foreground glow-brand" style={{ background: 'var(--gradient-brand)' }}>
              DC
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Key Numbers */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Net Pay", value: "MUR 245,800", sub: "+12% vs last month", icon: DollarSign, trend: "up" },
          { label: "Active Employees", value: "24", sub: "2 new this month", icon: Users, trend: "up" },
          { label: "Checklist Pending", value: String(5 - doneCount), sub: "Items needing action", icon: AlertTriangle, trend: "down" },
          { label: "MRA Payment", value: "MUR 38,420", sub: "PAYE + CSG/NSF + Levy", icon: FileText, trend: "neutral" },
        ].map((card) => (
          <GlassCard key={card.label} className="group hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <card.icon className="h-4 w-4 text-primary" />
              </div>
              {card.trend === "up" && <TrendingUp className="h-4 w-4 text-success" />}
              {card.trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{card.sub}</div>
          </GlassCard>
        ))}
      </div>

      {/* Checklist + Leaves */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard>
          <h3 className="text-base font-semibold mb-4">Checklist Summary</h3>
          <div className="flex gap-5 items-start">
            <ChecklistRing done={doneCount} total={5} />
            <div className="flex-1 space-y-2">
              {checklist.map((item, i) => (
                <div key={item.label} className="flex items-center justify-between gap-2 glass rounded-xl px-3 py-2.5">
                  <div className="flex gap-2.5 items-center">
                    <span className={`h-2 w-2 rounded-full ${item.done ? "bg-success" : "bg-destructive"}`} />
                    <span className="text-sm font-medium">{i + 1}. {item.label}</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                    item.done
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {item.done ? "Done" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-base font-semibold mb-4">Leaves — {currentMonth} {currentYear}</h3>
          <div className="space-y-2">
            {leaveData.map((row, i) => (
              <div key={i} className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{row.name}</div>
                  <div className="text-xs text-muted-foreground">{row.type} • {row.dates} • {row.days} days</div>
                </div>
                <span className={`inline-flex gap-1.5 items-center text-xs font-medium px-2.5 py-1 rounded-lg ${
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
        <h3 className="text-base font-semibold mb-3">Open Items (previous periods)</h3>
        {openItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No open items 🎉</p>
        ) : (
          <div className="space-y-2">
            {openItems.map((row, i) => (
              <div key={i} className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <span className="text-sm font-medium w-20">{row.period}</span>
                  <span className="text-sm text-muted-foreground">{row.item}</span>
                  <span className="text-sm text-muted-foreground">Due: {row.due}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-lg">{row.status}</span>
                  <button className="text-xs font-medium text-primary hover:underline">Resolve</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <div className="text-center text-muted-foreground text-xs pb-2">
        © {currentYear} DC Payroll. All rights reserved.
      </div>
    </div>
  );
};

export default Dashboard;
