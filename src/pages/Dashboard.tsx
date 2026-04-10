import ChecklistRing from "@/components/ChecklistRing";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const checklist = [
  { label: "1) Payroll", done: true },
  { label: "2) Payslips", done: true },
  { label: "3) Filing (MRA)", done: false },
  { label: "4) Payment sent to MRA", done: false },
  { label: "5) Payment received by MRA", done: false },
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
  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-end gap-2.5 mb-3 flex-wrap">
        <button className="px-3 py-2 border border-border rounded-xl text-sm text-foreground bg-transparent hover:bg-secondary transition-colors">← Prev</button>
        <select className="bg-panel-2 border border-input text-foreground rounded-[10px] px-2.5 py-2 h-[38px] text-sm">
          <option>DC Power Pro Ltd</option>
        </select>
        <span className="text-sm text-muted-foreground">Month</span>
        <select className="bg-panel-2 border border-input text-foreground rounded-[10px] px-2.5 py-2 h-[38px] text-sm">
          {months.map((m, i) => (
            <option key={m} selected={i === now.getMonth()}>{m}</option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">Year</span>
        <select className="bg-panel-2 border border-input text-foreground rounded-[10px] px-2.5 py-2 h-[38px] text-sm">
          {[currentYear - 1, currentYear, currentYear + 1].map(y => (
            <option key={y} selected={y === currentYear}>{y}</option>
          ))}
        </select>
        <button className="px-3 py-2 border border-border rounded-xl text-sm text-foreground bg-transparent hover:bg-secondary transition-colors">Next →</button>
      </div>

      {/* Payroll Assistant */}
      <section className="bg-card border border-border rounded-2xl p-4 flex items-start justify-between gap-3.5">
        <div>
          <span className="inline-block bg-primary/15 text-primary font-semibold text-[13px] px-2.5 py-1.5 rounded-full">
            Payroll Assistant
          </span>
          <div className="text-[15px] mt-1.5 text-foreground">MRA filing is pending.</div>
          <div className="text-[13px] text-muted-foreground mt-1">Period: 1 {currentMonth} – {new Date(currentYear, now.getMonth() + 1, 0).getDate()} {currentMonth} {currentYear}</div>
          <div className="flex gap-2.5 mt-2.5 flex-wrap">
            <span className="inline-flex gap-2 items-center bg-panel-2 border border-border rounded-full px-3 py-2 text-[13px]">
              <span className="h-2.5 w-2.5 rounded-full bg-success" /> On track
            </span>
            <span className="inline-flex gap-2 items-center bg-panel-2 border border-border rounded-full px-3 py-2 text-[13px]">
              Filing due on 30 {months[(now.getMonth() + 1) % 12]} {currentYear}
            </span>
            <button className="bg-panel-2 border border-border text-foreground rounded-full px-3 py-2 font-semibold text-[13px] hover:bg-secondary transition-colors">
              Next: File MRA returns →
            </button>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="h-14 w-14 rounded-xl flex items-center justify-center font-bold text-foreground" style={{ background: 'var(--gradient-brand)' }}>
            DC
          </div>
          <div>
            <div className="font-extrabold text-lg leading-tight">DC Power Pro Ltd</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
        </div>
      </section>

      {/* Grid: Checklist + Key Numbers */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <section className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-base font-semibold mb-2">Checklist Summary</h3>
          <div className="flex gap-4 items-center">
            <ChecklistRing done={doneCount} total={5} />
            <div className="grid gap-2.5 flex-1">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-2.5 border border-border bg-panel-2 rounded-xl px-3 py-2.5">
                  <div className="flex gap-2.5 items-center">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.done ? "bg-success" : "bg-destructive"}`} />
                    <strong className="text-sm">{item.label}</strong>
                  </div>
                  <button className={`text-xs font-bold px-2.5 py-1.5 rounded-[10px] border min-w-[100px] text-center ${
                    item.done
                      ? "bg-primary/15 border-primary/30 text-primary"
                      : "bg-destructive/10 border-destructive/30 text-destructive"
                  }`}>
                    {item.done ? "Completed" : "Pending"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-base font-semibold mb-2">Key Numbers</h3>
          <div className="grid grid-cols-2 gap-3.5">
            {[
              { label: "This Month Net Pay", value: "MUR 245,800", sub: "Total net paid to staff." },
              { label: "Checklist Pending", value: String(5 - doneCount), sub: "Items needing action." },
              { label: "Next Filing Due", value: "30 Aug 2025", sub: "Filing due on 30 Aug 2025" },
              { label: "MRA Payment", value: "MUR 38,420", sub: "PAYE + CSG/NSF + Levy + PRGF." },
            ].map((card) => (
              <div key={card.label} className="border border-border bg-panel-2 rounded-[14px] p-3.5">
                <div className="text-muted-foreground text-xs mb-1.5">{card.label}</div>
                <div className="text-[26px] font-extrabold">{card.value}</div>
                <div className="text-muted-foreground text-xs">{card.sub}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Grid: Leaves + Open Items */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <section className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-base font-semibold mb-2">Employees on leave for {currentMonth} {currentYear}</h3>
          <div className="border border-border rounded-[14px] overflow-hidden">
            <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr_0.6fr_0.5fr] bg-panel-2 text-xs text-muted-foreground">
              {["Employee", "Type", "Dates", "Days", "Status"].map(h => (
                <div key={h} className="px-3 py-2.5">{h}</div>
              ))}
            </div>
            {leaveData.map((row, i) => (
              <div key={i} className="grid grid-cols-[1.2fr_0.9fr_0.9fr_0.6fr_0.5fr] bg-panel-2 border-t border-border text-sm">
                <div className="px-3 py-2.5">{row.name}</div>
                <div className="px-3 py-2.5">{row.type}</div>
                <div className="px-3 py-2.5">{row.dates}</div>
                <div className="px-3 py-2.5">{row.days}</div>
                <div className="px-3 py-2.5">
                  <span className="inline-flex gap-1.5 items-center bg-chip border border-border rounded-full px-2 py-1 text-xs">
                    <span className={`h-2 w-2 rounded-full ${row.status === "Approved" ? "bg-success" : "bg-warning"}`} />
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-base font-semibold mb-2">Open Items (previous periods)</h3>
          <div className="border border-border rounded-[14px] overflow-hidden">
            <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr_0.6fr_0.5fr] bg-panel-2 text-xs text-muted-foreground">
              {["Period", "Item", "Due", "Status", "Action"].map(h => (
                <div key={h} className="px-3 py-2.5">{h}</div>
              ))}
            </div>
            {openItems.length === 0 ? (
              <div className="px-3 py-4 text-center text-muted-foreground text-sm">No open items</div>
            ) : (
              openItems.map((row, i) => (
                <div key={i} className="grid grid-cols-[1.2fr_0.9fr_0.9fr_0.6fr_0.5fr] bg-panel-2 border-t border-border text-sm">
                  <div className="px-3 py-2.5">{row.period}</div>
                  <div className="px-3 py-2.5">{row.item}</div>
                  <div className="px-3 py-2.5">{row.due}</div>
                  <div className="px-3 py-2.5">
                    <span className="text-destructive text-xs font-semibold">{row.status}</span>
                  </div>
                  <div className="px-3 py-2.5">
                    <button className="text-primary text-xs font-semibold hover:underline">Resolve</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 mb-2 text-center text-muted-foreground text-xs">
        © {currentYear} DC Payroll. All rights reserved.
      </div>
    </div>
  );
};

export default Dashboard;
