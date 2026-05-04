import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, LogOut, Download, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

interface PayslipEntry {
  id: string;
  basic_salary: number;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  additions: any;
  deductions: any;
  payroll_file: { month: number; year: number; status: string } | null;
}

interface LeaveBalance {
  type_name: string;
  entitlement: number;
  used: number;
}

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const EmployeePortal = () => {
  const { user, displayName, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [payslips, setPayslips] = useState<PayslipEntry[]>([]);
  const [leaves, setLeaves] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"payslips" | "leaves">("payslips");

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Find employee record linked to this user's email
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", user!.id)
        .single();

      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      // Find employee by email match
      const { data: emp } = await supabase
        .from("employees")
        .select("id")
        .eq("company_id", profile.company_id)
        .eq("email", user!.email)
        .single();

      if (!emp) {
        setLoading(false);
        return;
      }

      // Fetch payroll entries
      const { data: entries } = await supabase
        .from("payroll_entries")
        .select("id, basic_salary, gross_pay, total_deductions, net_pay, additions, deductions, payroll_file_id")
        .eq("employee_id", emp.id)
        .order("created_at", { ascending: false })
        .limit(12);

      if (entries && entries.length > 0) {
        // Fetch payroll file details
        const fileIds = [...new Set(entries.map(e => e.payroll_file_id))];
        const { data: files } = await supabase
          .from("payroll_files")
          .select("id, month, year, status")
          .in("id", fileIds);

        const fileMap = new Map(files?.map(f => [f.id, f]) || []);
        setPayslips(entries.map(e => ({
          ...e,
          payroll_file: fileMap.get(e.payroll_file_id) || null,
        })));
      }

      // Fetch leave balances
      const { data: leaveTypes } = await supabase
        .from("leave_types")
        .select("id, name, annual_entitlement_days")
        .eq("company_id", profile.company_id)
        .eq("is_active", true);

      if (leaveTypes) {
        const currentYear = new Date().getFullYear();
        const { data: leaveReqs } = await supabase
          .from("leave_requests")
          .select("leave_type_id, days, status")
          .eq("employee_id", emp.id)
          .in("status", ["approved", "pending"]);

        const balances: LeaveBalance[] = leaveTypes.map(lt => {
          const used = (leaveReqs || [])
            .filter(r => r.leave_type_id === lt.id && r.status === "approved")
            .reduce((sum, r) => sum + Number(r.days), 0);
          return {
            type_name: lt.name,
            entitlement: Number(lt.annual_entitlement_days) || 0,
            used,
          };
        });
        setLeaves(balances);
      }
    } catch (err: any) {
      toast.error("Failed to load portal data");
    }
    setLoading(false);
  };

  const firstName = displayName ? displayName.split(" ")[0] : "Employee";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center font-display font-semibold text-sm text-primary-foreground"
              style={{ background: "var(--gradient-emerald)" }}
            >
              DC
            </div>
            <div>
              <span className="font-display font-semibold text-foreground">DC Payroll</span>
              <span className="text-[10px] ml-2 uppercase tracking-wider text-muted-foreground">Employee Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-secondary/50 transition-colors text-muted-foreground">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-foreground mb-1">
          Welcome, {firstName}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">View your payslips and leave balances</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-secondary/40 rounded-lg p-1 w-fit">
          {(["payslips", "leaves"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "payslips" ? <><FileText className="h-4 w-4 inline mr-2" />Payslips</> : <><Calendar className="h-4 w-4 inline mr-2" />Leave Balances</>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full" />
          </div>
        ) : activeTab === "payslips" ? (
          <div className="space-y-3">
            {payslips.length === 0 ? (
              <GlassCard className="text-center py-12">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No payslips available yet.</p>
              </GlassCard>
            ) : (
              payslips.map((p) => (
                <GlassCard key={p.id} className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-display text-lg font-medium text-foreground">
                      {p.payroll_file ? `${months[p.payroll_file.month - 1]} ${p.payroll_file.year}` : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex gap-4">
                      <span>Basic: MUR {Number(p.basic_salary).toLocaleString()}</span>
                      <span>Gross: MUR {Number(p.gross_pay).toLocaleString()}</span>
                      <span>Deductions: MUR {Number(p.total_deductions).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-display text-xl font-semibold text-primary">
                        MUR {Number(p.net_pay).toLocaleString()}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Net Pay</div>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaves.length === 0 ? (
              <GlassCard className="col-span-full text-center py-12">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No leave types configured.</p>
              </GlassCard>
            ) : (
              leaves.map((l) => (
                <GlassCard key={l.type_name}>
                  <div className="font-display text-lg font-medium text-foreground mb-3">{l.type_name}</div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Used</span>
                    <span className="text-foreground font-medium">{l.used} / {l.entitlement} days</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${l.entitlement > 0 ? Math.min((l.used / l.entitlement) * 100, 100) : 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {Math.max(l.entitlement - l.used, 0)} days remaining
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-20 py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            © {new Date().getFullYear()} DC Payroll
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
            Powered by <span className="text-[#d4af37]/90 font-medium">MB18 Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EmployeePortal;
