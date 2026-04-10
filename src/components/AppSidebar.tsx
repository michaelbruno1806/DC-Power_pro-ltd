import { useNavigate, useLocation } from "react-router-dom";

const navSections = [
  {
    label: "Home",
    items: [
      { icon: "🏠", label: "Dashboard", path: "/" },
    ],
  },
  {
    label: "Payroll",
    items: [
      { icon: "📁", label: "Payroll Files", path: "/payroll" },
      { icon: "🧾", label: "Payslips", path: "/payslips" },
      { icon: "✅", label: "Checklist", path: "/checklist" },
      { icon: "📊", label: "MRA Filings", path: "/mra-filings" },
    ],
  },
  {
    label: "People",
    items: [
      { icon: "🏢", label: "Company Details", path: "/company-setup" },
      { icon: "👥", label: "Employees", path: "/employees" },
      { icon: "🌴", label: "Leaves", path: "/leaves" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { icon: "🧩", label: "Payroll Components", path: "/components" },
      { icon: "🕒", label: "Working Days & Hours", path: "/working-days" },
      { icon: "🎉", label: "Holidays", path: "/holidays" },
    ],
  },
];

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-[260px] min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="flex items-center gap-2.5 px-4 py-[18px]">
        <div className="h-[38px] w-[38px] rounded-[10px] flex items-center justify-center font-bold text-foreground shadow-[0_4px_16px_rgba(16,185,129,0.25)]" style={{ background: 'var(--gradient-brand)' }}>
          DC
        </div>
        <div>
          <div className="font-bold text-foreground">DC Payroll</div>
          <div className="text-xs text-muted-foreground">Fast • Compliant • Easy</div>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-4 overflow-auto scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="px-3 pt-2.5 pb-0.5 text-muted-foreground text-[11px] uppercase tracking-wider">
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 my-1 border rounded-xl text-left text-sm cursor-pointer transition-colors ${
                    isActive
                      ? "bg-sidebar-accent border-border shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] text-foreground"
                      : "bg-panel-2 border-border text-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <span className="min-w-[18px] text-center">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3">
        <button className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-3.5 rounded-xl hover:bg-brand-hover transition-colors">
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
