import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/use-company-id";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Mail, ShieldCheck, Eye } from "lucide-react";

interface Link {
  id: string;
  accountant_user_id: string | null;
  invite_email: string | null;
  role: "view" | "manage";
  accepted_at: string | null;
}

const inviteSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  role: z.enum(["view", "manage"]),
});

const Accountants = () => {
  const companyId = useCompanyId();
  const [links, setLinks] = useState<Link[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"view" | "manage">("view");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!companyId) return;
    const { data, error } = await supabase
      .from("accountant_company_links")
      .select("id, accountant_user_id, invite_email, role, accepted_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setLinks((data || []) as any);
  };

  useEffect(() => { load(); }, [companyId]);

  const invite = async () => {
    if (!companyId) return;
    const parsed = inviteSchema.safeParse({ email, role });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.from("accountant_company_links").insert({
      company_id: companyId,
      invite_email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
    } as any);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Invite sent to ${parsed.data.email}`);
    setEmail("");
    load();
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this accountant?")) return;
    const { error } = await supabase.from("accountant_company_links").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Revoked"); load(); }
  };

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Accountants</h3>
          <p className="text-xs text-muted-foreground mt-1">Invite your accountant by email. They'll see this company in their switcher after signing up.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4">
        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="accountant@firm.com" className="md:col-span-6 bg-secondary/40" />
        <Select value={role} onValueChange={(v) => setRole(v as any)}>
          <SelectTrigger className="md:col-span-3 bg-secondary/40"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="view">View only</SelectItem>
            <SelectItem value="manage">Manage</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={invite} disabled={loading} className="md:col-span-3 gap-2" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="h-4 w-4" /> Invite
        </Button>
      </div>

      <div className="space-y-2">
        {links.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No accountants yet.</p>
        )}
        {links.map(l => (
          <div key={l.id} className="flex items-center gap-3 bg-secondary/20 p-3 rounded-lg border border-border/40">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{l.invite_email || l.accountant_user_id}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                {l.accepted_at ? "Active" : "Pending invite"} ·{" "}
                {l.role === "manage" ? <span className="text-primary"><ShieldCheck className="inline h-3 w-3 mr-0.5" /> Manage</span> : <span><Eye className="inline h-3 w-3 mr-0.5" /> View</span>}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => revoke(l.id)} className="text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accountants;
