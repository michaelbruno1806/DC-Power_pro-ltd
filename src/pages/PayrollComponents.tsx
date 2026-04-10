import { useState } from "react";

interface Component {
  id: string;
  label: string;
  code: string;
  kind: "addition" | "deduction";
  taxable: boolean;
  inWageBill: boolean;
  active: boolean;
}

const initialComponents: Component[] = [
  { id: "1", label: "Basic Salary", code: "basic_salary", kind: "addition", taxable: true, inWageBill: true, active: true },
  { id: "2", label: "Transport Allowance", code: "transport_allowance", kind: "addition", taxable: true, inWageBill: false, active: true },
  { id: "3", label: "Housing Allowance", code: "housing_allowance", kind: "addition", taxable: true, inWageBill: false, active: true },
  { id: "4", label: "Overtime", code: "overtime", kind: "addition", taxable: true, inWageBill: false, active: true },
  { id: "5", label: "Commission", code: "commission", kind: "addition", taxable: true, inWageBill: false, active: false },
  { id: "6", label: "Loan Deduction", code: "loan_deduction", kind: "deduction", taxable: false, inWageBill: false, active: true },
];

const PayrollComponents = () => {
  const [components, setComponents] = useState<Component[]>(initialComponents);
  const [newLabel, setNewLabel] = useState("");
  const [newKind, setNewKind] = useState<"addition" | "deduction">("addition");
  const [newTaxable, setNewTaxable] = useState(true);
  const [newInWB, setNewInWB] = useState(false);
  const [msg, setMsg] = useState("");

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40) || "comp";

  const handleAdd = () => {
    if (!newLabel.trim()) { setMsg("Enter a label"); return; }
    const comp: Component = {
      id: Date.now().toString(),
      label: newLabel.trim(),
      code: slugify(newLabel),
      kind: newKind,
      taxable: newTaxable,
      inWageBill: newInWB,
      active: true,
    };
    setComponents(prev => [...prev, comp]);
    setNewLabel("");
    setNewTaxable(true);
    setNewInWB(false);
    setNewKind("addition");
    setMsg("Added");
  };

  const toggle = (id: string, key: keyof Component) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, [key]: !c[key as keyof Component] } : c));
    setMsg("Saved");
  };

  const remove = (id: string) => {
    if (!confirm("Delete this component?")) return;
    setComponents(prev => prev.filter(c => c.id !== id));
    setMsg("Deleted");
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <header className="flex justify-between items-center mb-3.5 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-[10px] flex items-center justify-center font-bold text-foreground" style={{ background: 'var(--gradient-brand)' }}>
            DC
          </div>
          <div>
            <h1 className="text-[22px] font-semibold m-0">Payroll Components</h1>
            <div className="text-sm text-muted-foreground">Pick which allowances, bonuses, overtime and deductions you use.</div>
          </div>
        </div>
        <span className="bg-panel-2 border border-border text-muted-foreground px-2.5 py-2 rounded-[10px] text-xs">
          DC Power Pro Ltd
        </span>
      </header>

      {/* Add new */}
      <div className="bg-card border border-border rounded-[14px] p-3.5">
        <div className="flex gap-2.5 items-center flex-wrap">
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Label (e.g. Commission, Overtime, Housing Allowance)"
            className="flex-1 min-w-[320px] px-2.5 py-2.5 rounded-[10px] border border-input bg-panel-2 text-foreground text-sm"
          />
          <select
            value={newKind}
            onChange={e => setNewKind(e.target.value as "addition" | "deduction")}
            className="px-2.5 py-2.5 rounded-[10px] border border-input bg-panel-2 text-foreground text-sm"
          >
            <option value="addition">Addition</option>
            <option value="deduction">Deduction</option>
          </select>
          <label className="text-sm text-muted-foreground flex items-center gap-2">
            <input type="checkbox" checked={newTaxable} onChange={e => setNewTaxable(e.target.checked)} className="accent-primary" />
            Taxable
          </label>
          <label className="text-sm text-muted-foreground flex items-center gap-2">
            <input type="checkbox" checked={newInWB} onChange={e => setNewInWB(e.target.checked)} className="accent-primary" />
            In Wage Bill
          </label>
          <button onClick={handleAdd} className="bg-primary text-primary-foreground font-bold px-3.5 py-2.5 rounded-xl hover:bg-brand-hover transition-all hover:-translate-y-px text-sm">
            Add component
          </button>
          {msg && <span className={`text-sm ${msg === "Enter a label" ? "text-destructive" : "text-primary"}`}>{msg}</span>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-[14px] p-3.5 mt-3">
        <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}>
          <thead>
            <tr>
              <th className="px-2.5 py-2.5 text-left text-muted-foreground font-semibold text-sm min-w-[260px]">Label</th>
              <th className="px-2.5 py-2.5 text-left text-muted-foreground font-semibold text-sm">Type</th>
              <th className="px-2.5 py-2.5 text-left text-muted-foreground font-semibold text-sm">Taxable</th>
              <th className="px-2.5 py-2.5 text-left text-muted-foreground font-semibold text-sm">In Wage Bill</th>
              <th className="px-2.5 py-2.5 text-left text-muted-foreground font-semibold text-sm">Active</th>
              <th className="px-2.5 py-2.5 w-[100px]"></th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => (
              <tr key={c.id}>
                <td className="px-2.5 py-2.5 border-b border-border">
                  <div className="font-medium text-sm">{c.label}</div>
                  <div className="text-xs text-muted-foreground">code: <code className="text-xs">{c.code}</code></div>
                </td>
                <td className="px-2.5 py-2.5 border-b border-border text-sm capitalize">{c.kind}</td>
                <td className="px-2.5 py-2.5 border-b border-border">
                  <ToggleSwitch checked={c.taxable} onChange={() => toggle(c.id, "taxable")} />
                </td>
                <td className="px-2.5 py-2.5 border-b border-border">
                  <ToggleSwitch checked={c.inWageBill} onChange={() => toggle(c.id, "inWageBill")} />
                </td>
                <td className="px-2.5 py-2.5 border-b border-border">
                  <ToggleSwitch checked={c.active} onChange={() => toggle(c.id, "active")} />
                </td>
                <td className="px-2.5 py-2.5 border-b border-border">
                  <button onClick={() => remove(c.id)} className="bg-transparent text-foreground border border-border font-bold px-2.5 py-1.5 rounded-xl text-xs hover:bg-secondary transition-colors">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground mt-3">
        Tip: "Taxable" means it's included in <strong>Emoluments</strong>. "In Wage Bill" means it counts in Base+EOY for statutory calc.
      </div>
      <div className="text-sm text-muted-foreground mt-1">Changes are saved instantly. Reload the Payroll page to see new columns.</div>
      <div className="text-sm text-muted-foreground mt-[18px]">© DC Payroll</div>
    </div>
  );
};

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-[42px] h-6 rounded-full relative transition-colors cursor-pointer border ${
      checked ? "bg-primary/80 border-primary/50" : "bg-secondary border-input"
    }`}
  >
    <span
      className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-panel-2 transition-all ${
        checked ? "left-[21px]" : "left-[3px]"
      }`}
    />
  </button>
);

export default PayrollComponents;
