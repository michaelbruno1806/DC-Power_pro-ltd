import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, FolderOpen, FileText, CheckSquare, BarChart3,
  Building2, Users, Palmtree, Puzzle, Clock, PartyPopper,
  LogOut, Shield, ChevronLeft, ChevronRight
} from "lucide-react";
import { useState } from "react";

const navSections = [
  {
    label: "Home",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    ],
  },
  {
    label: "Payroll",
    items: [
      { icon: FolderOpen, label: "Payroll Files", path: "/payroll" },
      { icon: FileText, label: "Payslips", path: "/payslips" },
      { icon: CheckSquare, label: "Checklist", path: "/checklist" },
      { icon: BarChart3, label: "MRA Filings", path: "/mra-filings" },
    ],
  },
  {
    label: "People",
    items: [
      { icon: Building2, label: "Company Details", path: "/company-setup" },
      { icon: Users, label: "Employees", path: "/employees" },
      { icon: Palmtree, label: "Leaves", path: "/leaves" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { icon: Puzzle, label: "Payroll Components", path: "/components" },
      { icon: Clock, label: "Working Days & Hours", path: "/working-days" },
      { icon: PartyPopper, label: "Holidays", path: "/holidays" },
    ],
  },
];

const adminSection = {
  label: "Administration",
  items: [
    { icon: Shield, label: "Admin Panel", path: "/admin" },
  ],
};

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, displayName, role } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const sections = role === "super_admin" ? [...navSections, adminSection] : navSections;

  return (
    <aside className={`${collapsed ? "w-[72px]" : "w-[260px]"} min-h-screen glass-card flex flex-col transition-all duration-300 relative`}>
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-[18px] ${collapsed ? "justify-center" : ""}`}>
        <div className="h-[38px] w-[38px] min-w-[38px] rounded-xl flex items-center justify-center font-bold text-foreground glow-brand" style={{ background: 'var(--gradient-brand)' }}>
          DC
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-bold text-foreground text-sm">DC Payroll</div>
            <div className="text-[10px] text-muted-foreground">Fast • Compliant • Easy</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-4 overflow-auto scrollbar-thin">
        {sections.map((section) => (
          <div key={section.label} className="mb-1">
            {!collapsed && (
              <div className="px-3 pt-3 pb-1 text-muted-foreground text-[10px] uppercase tracking-widest font-medium">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 my-0.5 rounded-xl text-left text-sm cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium glow-brand"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`h-4 w-4 min-w-[16px] ${isActive ? "text-primary" : ""}`} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-border/50">
        {!collapsed && displayName && (
          <div className="px-3 py-2 mb-2 text-xs text-muted-foreground truncate">
            {displayName}
          </div>
        )}
        <button
          onClick={signOut}
          className={`w-full flex items-center gap-2 bg-destructive/10 text-destructive font-medium py-2.5 px-3 rounded-xl hover:bg-destructive/20 transition-colors text-sm ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="h-4 w-4 min-w-[16px]" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
