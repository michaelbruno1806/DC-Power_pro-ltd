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
import { Plus, Search, Edit2, Trash2, Users, UserCheck, UserX, Eye } from "lucide-react";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  nic: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  basic_salary: number | null;
  status: string | null;
  employment_date: string | null;
  bank_name: string | null;
  bank_account: string | null;
  address: string | null;
  date_of_birth: string | null;
}

const emptyForm = {
  first_name: "", last_name: "", nic: "", email: "", phone: "", gender: "",
  basic_salary: "", employment_date: "", bank_name: "", bank_account: "", address: "", date_of_birth: "",
};

const Employees = () => {
  const { companyId } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchEmployees = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setEmployees(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, [companyId]);

  const handleSubmit = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.error("First and last name are required");
      return;
    }
    if (!companyId) { toast.error("No company assigned"); return; }

    const payload = {
      company_id: companyId,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      nic: form.nic || null,
      email: form.email || null,
      phone: form.phone || null,
      gender: form.gender || null,
      basic_salary: form.basic_salary ? parseFloat(form.basic_salary) : 0,
      employment_date: form.employment_date || null,
      bank_name: form.bank_name || null,
      bank_account: form.bank_account || null,
      address: form.address || null,
      date_of_birth: form.date_of_birth || null,
    };

    if (editingId) {
      const { error } = await supabase.from("employees").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("Employee updated");
    } else {
      const { error } = await supabase.from("employees").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Employee added");
    }

    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchEmployees();
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({
      first_name: emp.first_name, last_name: emp.last_name,
      nic: emp.nic || "", email: emp.email || "", phone: emp.phone || "",
      gender: emp.gender || "", basic_salary: emp.basic_salary?.toString() || "",
      employment_date: emp.employment_date || "", bank_name: emp.bank_name || "",
      bank_account: emp.bank_account || "", address: emp.address || "",
      date_of_birth: emp.date_of_birth || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this employee?")) return;
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Employee deleted"); fetchEmployees(); }
  };

  const filtered = employees.filter(e => {
    const matchesSearch = `${e.first_name} ${e.last_name} ${e.nic || ""} ${e.email || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === "active").length,
    inactive: employees.filter(e => e.status !== "active").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage your workforce</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2 glow-brand"><Plus className="h-4 w-4" /> Add Employee</Button>
          </DialogTrigger>
          <DialogContent className="glass-elevated border-border/50 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} placeholder="John" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} placeholder="Doe" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>NIC</Label>
                <Input value={form.nic} onChange={e => setForm({...form, nic: e.target.value})} placeholder="N1234567890" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="59001234" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={v => setForm({...form, gender: v})}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Employment Date</Label>
                <Input type="date" value={form.employment_date} onChange={e => setForm({...form, employment_date: e.target.value})} className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Basic Salary (MUR)</Label>
                <Input type="number" value={form.basic_salary} onChange={e => setForm({...form, basic_salary: e.target.value})} placeholder="25000" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input value={form.bank_name} onChange={e => setForm({...form, bank_name: e.target.value})} placeholder="MCB" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Bank Account</Label>
                <Input value={form.bank_account} onChange={e => setForm({...form, bank_account: e.target.value})} placeholder="000123456789" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Port Louis, Mauritius" className="bg-secondary/50" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} className="glow-brand">{editingId ? "Update" : "Add"} Employee</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Employees", value: stats.total, icon: Users, color: "text-primary" },
          { label: "Active", value: stats.active, icon: UserCheck, color: "text-success" },
          { label: "Inactive / Terminated", value: stats.inactive, icon: UserX, color: "text-destructive" },
        ].map(s => (
          <GlassCard key={s.label}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..." className="pl-10 bg-secondary/50" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-secondary/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {["Name", "NIC", "Email", "Salary", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No employees found</td></tr>
              ) : filtered.map(emp => (
                <tr key={emp.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{emp.first_name} {emp.last_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.nic || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.email || "—"}</td>
                  <td className="px-4 py-3 font-medium">MUR {emp.basic_salary?.toLocaleString() || "0"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                      emp.status === "active" ? "bg-success/10 text-success" :
                      emp.status === "terminated" ? "bg-destructive/10 text-destructive" :
                      "bg-warning/10 text-warning"
                    }`}>{emp.status || "active"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setViewEmployee(emp); setViewDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleEdit(emp)} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(emp.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* View Employee Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="glass-elevated border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {viewEmployee && (
            <div className="space-y-3 mt-2">
              {[
                ["Name", `${viewEmployee.first_name} ${viewEmployee.last_name}`],
                ["NIC", viewEmployee.nic],
                ["Email", viewEmployee.email],
                ["Phone", viewEmployee.phone],
                ["Gender", viewEmployee.gender],
                ["DOB", viewEmployee.date_of_birth],
                ["Employment Date", viewEmployee.employment_date],
                ["Basic Salary", viewEmployee.basic_salary ? `MUR ${viewEmployee.basic_salary.toLocaleString()}` : null],
                ["Bank", viewEmployee.bank_name ? `${viewEmployee.bank_name} — ${viewEmployee.bank_account}` : null],
                ["Address", viewEmployee.address],
                ["Status", viewEmployee.status],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{(value as string) || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
