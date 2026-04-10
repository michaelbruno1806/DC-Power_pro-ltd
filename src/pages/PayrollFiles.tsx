import { useState, useEffect } from "react";
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
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payroll Files</h1>
          <p className="text-sm text-muted-foreground">Monthly payroll processing</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 glow-brand"><Plus className="h-4 w-4" /> New Payroll</Button>
          </DialogTrigger>
          <DialogContent className="glass-elevated border-border/50">
            <DialogHeader><DialogTitle>Create Payroll File</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={newMonth} onValueChange={setNewMonth}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={newYear} onChange={e => setNewYear(e.target.value)} className="bg-secondary/50" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="glow-brand">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Files", value: files.length, icon: FileText },
          { label: "Completed", value: files.filter(f => f.status === "completed" || f.status === "approved").length, icon: CheckCircle2 },
          { label: "Pending", value: files.filter(f => f.status === "draft" || f.status === "processing").length, icon: AlertTriangle },
        ].map(s => (
          <GlassCard key={s.label}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
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
              <tr className="border-b border-border/50">
                {["Period", "Status", "Gross Pay", "Deductions", "Net Pay", "Created", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : files.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No payroll files yet. Create your first one!</td></tr>
              ) : files.map(f => (
                <tr key={f.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{months[f.month - 1]} {f.year}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${getStatusStyle(f.status)}`}>
                      {getStatusIcon(f.status)}
                      {f.status || "draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">MUR {(f.total_gross || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-destructive">MUR {(f.total_deductions || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-primary">MUR {(f.total_net || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
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
