import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard, FolderOpen, FileText, CheckSquare, BarChart3,
  Building2, Users, Palmtree, Puzzle, Clock, PartyPopper,
  LogOut, Shield, ChevronLeft, ChevronRight, Sun, Moon, Menu, X
} from "lucide-react";
import { useState } from "react";

const navSections = [
  {
    label: "Home",
    items: [{ icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" }],
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
  items: [{ icon: Shield, label: "Admin Panel", path: "/admin" }],
};

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, displayName, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = role === "super_admin" ? [...navSections, adminSection] : navSections;
  const initials = displayName ? displayName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "U";

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className={`flex items-center gap-3 px-5 py-6 border-b border-sidebar-border ${collapsed && !isMobile ? "justify-center px-0" : ""}`}>
        <div
          className="h-10 w-10 min-w-[40px] rounded-lg flex items-center justify-center font-display font-semibold text-base text-primary-foreground shrink-0"
          style={{ background: "var(--gradient-emerald)", boxShadow: "var(--shadow-glow)" }}
        >
          DC
        </div>
        {(!collapsed || isMobile) && (
          <div className="overflow-hidden">
            <div className="font-display font-semibold text-foreground text-lg leading-tight tracking-wide">DC Payroll</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Premium · Compliant</div>
          </div>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-auto scrollbar-thin">
        {sections.map((section) => (
          <div key={section.label} className="mb-2">
            {(!collapsed || isMobile) && (
              <div className="px-3 pt-3 pb-2 text-muted-foreground text-[10px] uppercase tracking-[0.18em] font-medium">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-md text-left text-sm cursor-pointer transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                  } ${collapsed && !isMobile ? "justify-center" : ""}`}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  {isActive && (!collapsed || isMobile) && (
                    <span className="absolute left-0 h-6 w-[2px] bg-primary rounded-r-full" />
                  )}
                  <Icon className={`h-[18px] w-[18px] min-w-[18px] transition-colors ${isActive ? "text-primary" : "group-hover:text-foreground"}`} />
                  {(!collapsed || isMobile) && <span className="tracking-wide">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-sidebar-border">
        {(!collapsed || isMobile) && displayName && (
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-md bg-sidebar-accent/50">
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-foreground truncate">{displayName}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {role === "super_admin" ? "Super Admin" : "Admin"}
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 text-muted-foreground py-2.5 px-3 rounded-md hover:bg-sidebar-accent hover:text-foreground transition-colors text-sm ${collapsed && !isMobile ? "justify-center w-full" : ""}`}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 min-w-[16px]" /> : <Moon className="h-4 w-4 min-w-[16px]" />}
            {(!collapsed || isMobile) && (theme === "dark" ? "Light mode" : "Dark mode")}
          </button>
        </div>
        <button
          onClick={() => { signOut(); if (isMobile) setMobileOpen(false); }}
          className={`w-full flex items-center gap-2 text-muted-foreground font-medium py-2.5 px-3 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-sm ${collapsed && !isMobile ? "justify-center" : ""}`}
        >
          <LogOut className="h-4 w-4 min-w-[16px]" />
          {(!collapsed || isMobile) && "Sign out"}
        </button>
      </div>
    </>
  );

  // Mobile: hamburger button + slide-over
  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center text-foreground shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        )}

        {/* Drawer */}
        <aside
          className={`fixed top-0 left-0 z-[70] h-full w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={`${collapsed ? "w-[76px]" : "w-[260px]"} min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-400 ease-elegant relative shrink-0`}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 z-10 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
      {sidebarContent}
    </aside>
  );
};

export default AppSidebar;
