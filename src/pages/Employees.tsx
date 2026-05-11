import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import * as XLSX from "xlsx";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, Users, UserCheck, UserX, Eye, Upload, Download, FileSpreadsheet } from "lucide-react";

const employeeSchema = z.object({
  first_name: z.string().trim().min(1, "First name required").max(50),
  last_name: z.string().trim().min(1, "Last name required").max(50),
  nic: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.union([z.string().trim().email("Invalid email").max(255), z.literal("")]).optional(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  basic_salary: z.number().min(0, "Salary must be ≥ 0").max(10_000_000),
});

interface Employee {
  id: string;
  employee_code: string | null;
  first_name: string;
  last_name: string;
  nic: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  basic_salary: number | null;
  transport_allowance: number | null;
  status: string | null;
  employment_date: string | null;
  employment_type: string | null;
  job_title: string | null;
  department: string | null;
  bank_name: string | null;
  bank_account: string | null;
  address: string | null;
  date_of_birth: string | null;
  marital_status: string | null;
  dependents: number | null;
  edf_form_url: string | null;
  id_card_url: string | null;
}

const emptyForm = {
  employee_code: "", first_name: "", last_name: "", nic: "", email: "", phone: "", gender: "",
  basic_salary: "", transport_allowance: "", employment_date: "", employment_type: "permanent",
  job_title: "", department: "", bank_name: "", bank_account: "", address: "", date_of_birth: "",
  marital_status: "", dependents: "0",
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
  const [edfFile, setEdfFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const fetchEmployees = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setEmployees((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, [companyId]);

  const uploadDoc = async (file: File, kind: "edf" | "id", empId: string) => {
    const ext = file.name.split(".").pop();
    const path = `${companyId}/${empId}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("employee-documents").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return null; }
    return path;
  };

  const handleSubmit = async () => {
    if (!companyId) { toast.error("No company assigned"); return; }
    const validated = employeeSchema.safeParse({
      first_name: form.first_name,
      last_name: form.last_name,
      nic: form.nic,
      email: form.email,
      phone: form.phone,
      basic_salary: form.basic_salary ? parseFloat(form.basic_salary) : 0,
    });
    if (!validated.success) {
      toast.error(validated.error.issues[0].message);
      return;
    }

    const payload: any = {
      company_id: companyId,
      employee_code: form.employee_code || null,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      nic: form.nic || null,
      email: form.email || null,
      phone: form.phone || null,
      gender: form.gender || null,
      basic_salary: form.basic_salary ? parseFloat(form.basic_salary) : 0,
      transport_allowance: form.transport_allowance ? parseFloat(form.transport_allowance) : 0,
      employment_date: form.employment_date || null,
      employment_type: form.employment_type || "permanent",
      job_title: form.job_title || null,
      department: form.department || null,
      bank_name: form.bank_name || null,
      bank_account: form.bank_account || null,
      address: form.address || null,
      date_of_birth: form.date_of_birth || null,
      marital_status: form.marital_status || null,
      dependents: form.dependents ? parseInt(form.dependents) : 0,
    };

    let empId = editingId;
    if (editingId) {
      const { error } = await supabase.from("employees").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
    } else {
      const { data, error } = await supabase.from("employees").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      empId = data.id;
    }

    if (empId) {
      const updates: any = {};
      if (edfFile) {
        const p = await uploadDoc(edfFile, "edf", empId);
        if (p) updates.edf_form_url = p;
      }
      if (idFile) {
        const p = await uploadDoc(idFile, "id", empId);
        if (p) updates.id_card_url = p;
      }
      if (Object.keys(updates).length) {
        await supabase.from("employees").update(updates).eq("id", empId);
      }
    }

    toast.success(editingId ? "Employee updated" : "Employee added");
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setEdfFile(null);
    setIdFile(null);
    fetchEmployees();
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({
      employee_code: emp.employee_code || "",
      first_name: emp.first_name, last_name: emp.last_name,
      nic: emp.nic || "", email: emp.email || "", phone: emp.phone || "",
      gender: emp.gender || "", basic_salary: emp.basic_salary?.toString() || "",
      transport_allowance: emp.transport_allowance?.toString() || "",
      employment_date: emp.employment_date || "",
      employment_type: emp.employment_type || "permanent",
      job_title: emp.job_title || "", department: emp.department || "",
      bank_name: emp.bank_name || "", bank_account: emp.bank_account || "",
      address: emp.address || "", date_of_birth: emp.date_of_birth || "",
      marital_status: emp.marital_status || "",
      dependents: emp.dependents?.toString() || "0",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this employee?")) return;
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Employee deleted"); fetchEmployees(); }
  };

  const downloadTemplate = () => {
    const headers = [[
      "employee_code", "first_name", "last_name", "nic", "email", "phone",
      "gender", "date_of_birth", "marital_status", "dependents",
      "employment_date", "employment_type", "job_title", "department",
      "basic_salary", "transport_allowance", "bank_name", "bank_account", "address",
    ]];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "employees-template.xlsx");
  };

  const handleImport = async (file: File) => {
    if (!companyId) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(ws);
      if (rows.length === 0) { toast.error("File is empty"); return; }

      const records = rows
        .filter(r => r.first_name && r.last_name)
        .map(r => ({
          company_id: companyId,
          employee_code: r.employee_code?.toString() || null,
          first_name: r.first_name.toString().trim(),
          last_name: r.last_name.toString().trim(),
          nic: r.nic?.toString() || null,
          email: r.email?.toString() || null,
          phone: r.phone?.toString() || null,
          gender: r.gender?.toString().toLowerCase() || null,
          date_of_birth: r.date_of_birth || null,
          marital_status: r.marital_status?.toString() || null,
          dependents: parseInt(r.dependents) || 0,
          employment_date: r.employment_date || null,
          employment_type: r.employment_type?.toString() || "permanent",
          job_title: r.job_title?.toString() || null,
          department: r.department?.toString() || null,
          basic_salary: parseFloat(r.basic_salary) || 0,
          transport_allowance: parseFloat(r.transport_allowance) || 0,
          bank_name: r.bank_name?.toString() || null,
          bank_account: r.bank_account?.toString() || null,
          address: r.address?.toString() || null,
        }));

      if (records.length === 0) { toast.error("No valid rows (first_name + last_name required)"); return; }

      const { error } = await supabase.from("employees").insert(records);
      if (error) { toast.error(error.message); return; }
      toast.success(`Imported ${records.length} employees`);
      fetchEmployees();
    } catch (err: any) {
      toast.error("Import failed: " + err.message);
    }
  };

  const filtered = employees.filter(e => {
    const matchesSearch = `${e.first_name} ${e.last_name} ${e.nic || ""} ${e.email || ""} ${e.employee_code || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === "active").length,
    inactive: employees.filter(e => e.status !== "active").length,
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-2">People</div>
          <h1 className="heading-display text-foreground">Employees</h1>
          <div className="divider-elegant mt-3" />
          <p className="text-sm text-muted-foreground mt-3">Manage your workforce records</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
            <Download className="h-4 w-4" /> Template
          </Button>
          <input ref={importRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])} />
          <Button variant="outline" size="sm" onClick={() => importRef.current?.click()} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Import
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); setEdfFile(null); setIdFile(null); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-11 px-5 font-medium tracking-wide" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
                <Plus className="h-4 w-4" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-medium">{editingId ? "Edit Employee" : "Add New Employee"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Employee Code</Label>
                  <Input value={form.employee_code} onChange={e => setForm({...form, employee_code: e.target.value})} placeholder="EMP-001" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>NIC</Label>
                  <Input value={form.nic} onChange={e => setForm({...form, nic: e.target.value})} placeholder="N1234567890" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-secondary/50" />
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
                  <Label>Marital Status</Label>
                  <Select value={form.marital_status} onValueChange={v => setForm({...form, marital_status: v})}>
                    <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dependents</Label>
                  <Input type="number" min="0" value={form.dependents} onChange={e => setForm({...form, dependents: e.target.value})} className="bg-secondary/50" />
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
                  <Label>Employment Type</Label>
                  <Select value={form.employment_type} onValueChange={v => setForm({...form, employment_type: v})}>
                    <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input value={form.job_title} onChange={e => setForm({...form, job_title: e.target.value})} placeholder="Accountant" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Finance" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Basic Salary (MUR)</Label>
                  <Input type="number" value={form.basic_salary} onChange={e => setForm({...form, basic_salary: e.target.value})} placeholder="25000" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Transport Allowance (MUR)</Label>
                  <Input type="number" value={form.transport_allowance} onChange={e => setForm({...form, transport_allowance: e.target.value})} placeholder="0" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input value={form.bank_name} onChange={e => setForm({...form, bank_name: e.target.value})} placeholder="MCB" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Bank Account</Label>
                  <Input value={form.bank_account} onChange={e => setForm({...form, bank_account: e.target.value})} className="bg-secondary/50" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>EDF Form (PDF/Image)</Label>
                  <Input type="file" accept=".pdf,image/*" onChange={e => setEdfFile(e.target.files?.[0] || null)} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>ID Card (PDF/Image)</Label>
                  <Input type="file" accept=".pdf,image/*" onChange={e => setIdFile(e.target.files?.[0] || null)} className="bg-secondary/50" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>{editingId ? "Update" : "Add"} Employee</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Employees", value: stats.total, icon: Users, color: "text-primary" },
          { label: "Active", value: stats.active, icon: UserCheck, color: "text-success" },
          { label: "Inactive / Terminated", value: stats.inactive, icon: UserX, color: "text-destructive" },
        ].map(s => (
          <GlassCard key={s.label} className="hover:border-primary/30">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <div className="font-display text-3xl font-semibold text-foreground">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..." className="pl-10 h-11 bg-secondary/40" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-11 bg-secondary/40"><SelectValue /></SelectTrigger>
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
              <tr className="border-b border-border bg-secondary/20">
                {["Code", "Name", "Job Title", "NIC", "Salary", "Status", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">No employees found</td></tr>
              ) : filtered.map(emp => (
                <tr key={emp.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono text-muted-foreground">{emp.employee_code || "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {(emp.first_name[0] || "") + (emp.last_name[0] || "")}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{emp.first_name} {emp.last_name}</div>
                        {emp.department && <div className="text-xs text-muted-foreground">{emp.department}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{emp.job_title || "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{emp.nic || "—"}</td>
                  <td className="px-5 py-4 font-medium text-foreground">MUR {emp.basic_salary?.toLocaleString() || "0"}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded ${
                      emp.status === "active" ? "bg-success/10 text-success" :
                      emp.status === "terminated" ? "bg-destructive/10 text-destructive" :
                      "bg-warning/10 text-warning"
                    }`}>{emp.status || "active"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => { setViewEmployee(emp); setViewDialogOpen(true); }} className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleEdit(emp)} className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(emp.id)} className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
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
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-medium">Employee Details</DialogTitle>
          </DialogHeader>
          {viewEmployee && (
            <div className="space-y-3 mt-2">
              {[
                ["Code", viewEmployee.employee_code],
                ["Name", `${viewEmployee.first_name} ${viewEmployee.last_name}`],
                ["NIC", viewEmployee.nic],
                ["Email", viewEmployee.email],
                ["Phone", viewEmployee.phone],
                ["Gender", viewEmployee.gender],
                ["Marital", viewEmployee.marital_status],
                ["Dependents", viewEmployee.dependents],
                ["DOB", viewEmployee.date_of_birth],
                ["Employment Date", viewEmployee.employment_date],
                ["Employment Type", viewEmployee.employment_type],
                ["Job Title", viewEmployee.job_title],
                ["Department", viewEmployee.department],
                ["Basic Salary", viewEmployee.basic_salary ? `MUR ${viewEmployee.basic_salary.toLocaleString()}` : null],
                ["Transport", viewEmployee.transport_allowance ? `MUR ${viewEmployee.transport_allowance.toLocaleString()}` : null],
                ["Bank", viewEmployee.bank_name ? `${viewEmployee.bank_name} — ${viewEmployee.bank_account}` : null],
                ["Address", viewEmployee.address],
                ["Status", viewEmployee.status],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-sm gap-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-right">{(value as string) || "—"}</span>
                </div>
              ))}
              {(viewEmployee.edf_form_url || viewEmployee.id_card_url) && (
                <div className="pt-3 mt-3 border-t border-border">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Documents</div>
                  <div className="flex gap-2 flex-wrap">
                    {viewEmployee.edf_form_url && <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">EDF uploaded</span>}
                    {viewEmployee.id_card_url && <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">ID uploaded</span>}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
