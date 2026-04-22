import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, FileText, Clock, CheckCircle2, AlertTriangle, Eye } from "lucide-react";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface PayrollFile {
  id: string;
  month: number;
  year: number;
  status: string | null;
  total_gross: number | null;
  total_deductions: number | null;
  total_net: number | null;
  created_at: string;
}

const PayrollFiles = () => {
  const { companyId, user } = useAuth();
  const [files, setFiles] = useState<PayrollFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMonth, setNewMonth] = useState(String(new Date().getMonth() + 1));
  const [newYear, setNewYear] = useState(String(new Date().getFullYear()));

  const fetchFiles = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("payroll_files")
      .select("*")
      .eq("company_id", companyId)
      .order("year", { ascending: false })
      .order("month", { ascending: false });
    if (error) toast.error(error.message);
    else setFiles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, [companyId]);

  const handleCreate = async () => {
    if (!companyId || !user) return;
    const { error } = await supabase.from("payroll_files").insert({
      company_id: companyId,
      month: parseInt(newMonth),
      year: parseInt(newYear),
      created_by: user.id,
    });
    if (error) {
      if (error.code === "23505") toast.error("Payroll file already exists for this period");
      else toast.error(error.message);
      return;
    }
    toast.success("Payroll file created");
    setDialogOpen(false);
    fetchFiles();
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed": case "approved": return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "processing": return <Clock className="h-4 w-4 text-warning" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusStyle = (status: string | null) => {
    switch (status) {
      case "completed": case "approved": return "bg-success/10 text-success";
      case "processing": return "bg-warning/10 text-warning";
      default: return "bg-secondary/50 text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-2">Payroll</div>
          <h1 className="heading-display text-foreground">Payroll Files</h1>
          <div className="divider-elegant mt-3" />
          <p className="text-sm text-muted-foreground mt-3">Monthly payroll processing & history</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 px-5 font-medium tracking-wide" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
              <Plus className="h-4 w-4" /> New Payroll
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display text-2xl font-medium">Create Payroll File</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Month</Label>
                <Select value={newMonth} onValueChange={setNewMonth}>
                  <SelectTrigger className="bg-secondary/40 h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Year</Label>
                <Input type="number" value={newYear} onChange={e => setNewYear(e.target.value)} className="bg-secondary/40 h-11" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Files", value: files.length, icon: FileText },
          { label: "Completed", value: files.filter(f => f.status === "completed" || f.status === "approved").length, icon: CheckCircle2 },
          { label: "Pending", value: files.filter(f => f.status === "draft" || f.status === "processing").length, icon: AlertTriangle },
        ].map(s => (
          <GlassCard key={s.label} className="hover:border-primary/30">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-display text-3xl font-semibold text-foreground">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                {["Period", "Status", "Gross Pay", "Deductions", "Net Pay", "Created", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : files.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">No payroll files yet. Create your first one.</td></tr>
              ) : files.map(f => (
                <tr key={f.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4 font-medium text-foreground">{months[f.month - 1]} {f.year}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded ${getStatusStyle(f.status)}`}>
                      {getStatusIcon(f.status)}
                      {f.status || "draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-foreground">MUR {(f.total_gross || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-destructive">MUR {(f.total_deductions || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-primary">MUR {(f.total_net || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-muted-foreground text-xs">{new Date(f.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <button className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default PayrollFiles;
