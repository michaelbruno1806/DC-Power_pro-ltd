import { useState, useEffect } from "react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Building2, Users, Plus, Edit2, Trash2, UserPlus, Search } from "lucide-react";

const companySchema = z.object({
  name: z.string().trim().min(1, "Company name required").max(120),
  ern: z.string().trim().max(20).optional().or(z.literal("")),
  brn: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.union([z.string().trim().email("Invalid email").max(255), z.literal("")]).optional(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

const assignSchema = z.object({
  userId: z.string().uuid("Select a user"),
  companyId: z.string().uuid("Select a company"),
  role: z.enum(["super_admin", "client_admin"]),
});

interface Company {
  id: string;
  name: string;
  ern: string | null;
  brn: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  company_id: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

const AdminPanel = () => {
  const { role } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [companyForm, setCompanyForm] = useState({ name: "", ern: "", brn: "", email: "", phone: "" });
  const [assignForm, setAssignForm] = useState({ userId: "", companyId: "", role: "client_admin" });

  const fetchData = async () => {
    setLoading(true);
    const [companiesRes, profilesRes, rolesRes] = await Promise.all([
      supabase.from("companies").select("*").order("name"),
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("*"),
    ]);
    if (companiesRes.data) setCompanies(companiesRes.data);
    if (profilesRes.data) setUsers(profilesRes.data);
    if (rolesRes.data) setRoles(rolesRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateCompany = async () => {
    const parsed = companySchema.safeParse(companyForm);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const { error } = await supabase.from("companies").insert({
      name: companyForm.name.trim(),
      ern: companyForm.ern || null,
      brn: companyForm.brn || null,
      email: companyForm.email || null,
      phone: companyForm.phone || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Company created");
    setCompanyDialogOpen(false);
    setCompanyForm({ name: "", ern: "", brn: "", email: "", phone: "" });
    fetchData();
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Delete this company and ALL its data?")) return;
    const { error } = await supabase.from("companies").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Company deleted"); fetchData(); }
  };

  const handleAssignUser = async () => {
    const parsed = assignSchema.safeParse(assignForm);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }

    // Replace any existing role for this user, then insert the new one.
    // Prevents accidental privilege accumulation when changing role.
    const { error: delErr } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", assignForm.userId);
    if (delErr) { toast.error(delErr.message); return; }

    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").update({ company_id: assignForm.companyId }).eq("user_id", assignForm.userId),
      supabase.from("user_roles").insert({ user_id: assignForm.userId, role: assignForm.role as any }),
    ]);

    if (profileRes.error) { toast.error(profileRes.error.message); return; }
    if (roleRes.error) { toast.error(roleRes.error.message); return; }

    toast.success("User assigned");
    setAssignDialogOpen(false);
    setAssignForm({ userId: "", companyId: "", role: "client_admin" });
    fetchData();
  };

  const getUserRole = (userId: string) => roles.find(r => r.user_id === userId)?.role || "none";
  const getUserCompany = (companyId: string | null) => companies.find(c => c.id === companyId)?.name || "Unassigned";

  if (role !== "super_admin") {
    return (
      <div className="flex items-center justify-center h-96 animate-fade-up">
        <GlassCard className="text-center max-w-md py-12">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-2xl font-medium mb-2">Access Denied</h2>
          <div className="divider-elegant mx-auto mb-4" />
          <p className="text-muted-foreground">You need super admin privileges to access this page.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <div className="eyebrow mb-2">Administration</div>
        <h1 className="heading-display text-foreground flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" /> Admin Panel
        </h1>
        <div className="divider-elegant mt-3" />
        <p className="text-sm text-muted-foreground mt-3">Manage companies, users and roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Building2, label: "Companies", value: companies.length },
          { icon: Users, label: "Users", value: users.length },
          { icon: Shield, label: "Super Admins", value: roles.filter(r => r.role === "super_admin").length },
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

      {/* Companies Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-section text-foreground">Companies</h2>
          <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 h-10"><Plus className="h-4 w-4" /> Add Company</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="font-display text-2xl font-medium">Create Company</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Company Name *</Label><Input value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} className="bg-secondary/40 h-11" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs uppercase tracking-wider text-muted-foreground">ERN</Label><Input value={companyForm.ern} onChange={e => setCompanyForm({...companyForm, ern: e.target.value})} className="bg-secondary/40 h-11" /></div>
                  <div className="space-y-2"><Label className="text-xs uppercase tracking-wider text-muted-foreground">BRN</Label><Input value={companyForm.brn} onChange={e => setCompanyForm({...companyForm, brn: e.target.value})} className="bg-secondary/40 h-11" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label><Input value={companyForm.email} onChange={e => setCompanyForm({...companyForm, email: e.target.value})} className="bg-secondary/40 h-11" /></div>
                  <div className="space-y-2"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Phone</Label><Input value={companyForm.phone} onChange={e => setCompanyForm({...companyForm, phone: e.target.value})} className="bg-secondary/40 h-11" /></div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setCompanyDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateCompany} style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/20">
              {["Company", "ERN", "BRN", "Email", "Created", ""].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">Loading...</td></tr>
            ) : companies.map(c => (
              <tr key={c.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                <td className="px-5 py-4 font-medium text-foreground">{c.name}</td>
                <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{c.ern || "—"}</td>
                <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{c.brn || "—"}</td>
                <td className="px-5 py-4 text-muted-foreground">{c.email || "—"}</td>
                <td className="px-5 py-4 text-muted-foreground text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-4">
                  <button onClick={() => handleDeleteCompany(c.id)} className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Users Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-section text-foreground">Users & Roles</h2>
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 h-10"><UserPlus className="h-4 w-4" /> Assign User</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="font-display text-2xl font-medium">Assign User to Company</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">User</Label>
                  <select value={assignForm.userId} onChange={e => setAssignForm({...assignForm, userId: e.target.value})} className="w-full px-3 py-2.5 rounded-md border border-input bg-secondary/40 text-foreground text-sm">
                    <option value="">Select user</option>
                    {users.map(u => <option key={u.user_id} value={u.user_id}>{u.display_name || u.user_id}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Company</Label>
                  <select value={assignForm.companyId} onChange={e => setAssignForm({...assignForm, companyId: e.target.value})} className="w-full px-3 py-2.5 rounded-md border border-input bg-secondary/40 text-foreground text-sm">
                    <option value="">Select company</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Role</Label>
                  <select value={assignForm.role} onChange={e => setAssignForm({...assignForm, role: e.target.value})} className="w-full px-3 py-2.5 rounded-md border border-input bg-secondary/40 text-foreground text-sm">
                    <option value="client_admin">Client Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAssignUser} style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>Assign</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {["User", "Role", "Company", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 font-medium">{u.display_name || "Unnamed"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                    getUserRole(u.user_id) === "super_admin" ? "bg-primary/10 text-primary" :
                    getUserRole(u.user_id) === "client_admin" ? "bg-success/10 text-success" :
                    "bg-secondary text-muted-foreground"
                  }`}>{getUserRole(u.user_id)}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{getUserCompany(u.company_id)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { setAssignForm({ userId: u.user_id, companyId: u.company_id || "", role: getUserRole(u.user_id) || "client_admin" }); setAssignDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};

export default AdminPanel;
