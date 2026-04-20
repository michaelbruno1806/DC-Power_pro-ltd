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

  const toggle = async (id: string, field: "taxable" | "in_wage_bill" | "is_active", value: boolean) => {
    const updateObj: Record<string, boolean> = {};
    updateObj[field] = !value;
    const { error } = await supabase.from("payroll_components").update(updateObj as any).eq("id", id);
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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
      <div>
        <div className="eyebrow mb-2">Configuration</div>
        <h1 className="heading-display text-foreground flex items-center gap-3">
          <Puzzle className="h-7 w-7 text-primary" /> Payroll Components
        </h1>
        <div className="divider-elegant mt-3" />
        <p className="text-sm text-muted-foreground mt-3">Allowances, bonuses and deductions</p>
      </div>

      {/* Add new */}
      <GlassCard>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[240px] space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Component</Label>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Overtime" className="bg-secondary/40 h-11" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger className="w-36 bg-secondary/40 h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="addition">Addition</SelectItem>
                <SelectItem value="deduction">Deduction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground h-11">
            <Switch checked={newTaxable} onCheckedChange={setNewTaxable} /> Taxable
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground h-11">
            <Switch checked={newInWB} onCheckedChange={setNewInWB} /> In Wage Bill
          </label>
          <Button onClick={handleAdd} className="gap-2 h-11 px-5 font-medium" style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/20">
              {["Name", "Type", "Taxable", "In Wage Bill", "Active", ""].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">Loading...</td></tr>
            ) : components.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">No components yet</td></tr>
            ) : components.map(c => (
              <tr key={c.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                <td className="px-5 py-4 font-medium text-foreground">{c.name}</td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded ${c.type === "addition" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {c.type}
                  </span>
                </td>
                <td className="px-5 py-4"><Switch checked={!!c.taxable} onCheckedChange={() => toggle(c.id, "taxable", !!c.taxable)} /></td>
                <td className="px-5 py-4"><Switch checked={!!c.in_wage_bill} onCheckedChange={() => toggle(c.id, "in_wage_bill", !!c.in_wage_bill)} /></td>
                <td className="px-5 py-4"><Switch checked={!!c.is_active} onCheckedChange={() => toggle(c.id, "is_active", !!c.is_active)} /></td>
                <td className="px-5 py-4">
                  <button onClick={() => remove(c.id)} className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <p className="text-xs text-muted-foreground italic">
        "Taxable" — included in Emoluments. "In Wage Bill" — counts toward base for statutory calculations.
      </p>
    </div>
  );
};

export default PayrollComponents;
