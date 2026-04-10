import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Puzzle } from "lucide-react";

interface PayrollComp {
  id: string;
  name: string;
  type: string;
  amount: number | null;
  is_percentage: boolean | null;
  taxable: boolean | null;
  in_wage_bill: boolean | null;
  is_active: boolean | null;
}

const PayrollComponents = () => {
  const { companyId } = useAuth();
  const [components, setComponents] = useState<PayrollComp[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("addition");
  const [newTaxable, setNewTaxable] = useState(true);
  const [newInWB, setNewInWB] = useState(false);

  const fetch = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase.from("payroll_components").select("*").eq("company_id", companyId).order("created_at");
    if (error) toast.error(error.message);
    else setComponents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [companyId]);

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error("Enter a name"); return; }
    if (!companyId) return;
    const { error } = await supabase.from("payroll_components").insert({
      company_id: companyId, name: newName.trim(), type: newType,
      taxable: newTaxable, in_wage_bill: newInWB,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Added");
    setNewName("");
    setNewTaxable(true);
    setNewInWB(false);
    fetch();
  };

  const toggle = async (id: string, field: string, value: boolean) => {
    const { error } = await supabase.from("payroll_components").update({ [field]: !value }).eq("id", id);
    if (error) toast.error(error.message);
    else fetch();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("payroll_components").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetch(); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-foreground glow-brand" style={{ background: 'var(--gradient-brand)' }}>
          <Puzzle className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Payroll Components</h1>
          <p className="text-sm text-muted-foreground">Allowances, bonuses, deductions</p>
        </div>
      </div>

      {/* Add new */}
      <GlassCard>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Component name (e.g. Overtime)" className="bg-secondary/50" />
          </div>
          <Select value={newType} onValueChange={setNewType}>
            <SelectTrigger className="w-36 bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="addition">Addition</SelectItem>
              <SelectItem value="deduction">Deduction</SelectItem>
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch checked={newTaxable} onCheckedChange={setNewTaxable} /> Taxable
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch checked={newInWB} onCheckedChange={setNewInWB} /> In Wage Bill
          </label>
          <Button onClick={handleAdd} className="gap-2 glow-brand"><Plus className="h-4 w-4" /> Add</Button>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {["Name", "Type", "Taxable", "In Wage Bill", "Active", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : components.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No components yet</td></tr>
            ) : components.map(c => (
              <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${c.type === "addition" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {c.type}
                  </span>
                </td>
                <td className="px-4 py-3"><Switch checked={!!c.taxable} onCheckedChange={() => toggle(c.id, "taxable", !!c.taxable)} /></td>
                <td className="px-4 py-3"><Switch checked={!!c.in_wage_bill} onCheckedChange={() => toggle(c.id, "in_wage_bill", !!c.in_wage_bill)} /></td>
                <td className="px-4 py-3"><Switch checked={!!c.is_active} onCheckedChange={() => toggle(c.id, "is_active", !!c.is_active)} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <p className="text-xs text-muted-foreground">
        "Taxable" = included in Emoluments. "In Wage Bill" = counts in base for statutory calculations.
      </p>
    </div>
  );
};

export default PayrollComponents;
