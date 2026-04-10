import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CompanySetup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "DC Power Pro Ltd",
    ern: "ERN123456",
    brn: "C12345678",
    address: "10 Royal Street, Port Louis, 11328",
    directors: "Jane Doe, John Lee",
    contact_email: "accounts@dcpower.mu",
    phone: "2123456",
    mobile: "59999999",
    payroll_start_day: "1",
    payroll_end_day: "31",
    mra_due_day: "30",
  });
  const [msg, setMsg] = useState("");

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleSave = () => {
    if (!form.name.trim()) {
      setMsg("Please provide Company name (required).");
      return;
    }
    setMsg("Saved! Redirecting…");
    setTimeout(() => navigate("/"), 500);
  };

  return (
    <div className="max-w-[860px] mx-auto">
      <header className="flex justify-between items-center mb-[18px] gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-[10px] flex items-center justify-center font-bold text-foreground" style={{ background: 'var(--gradient-brand)' }}>
            DC
          </div>
          <div>
            <h1 className="text-[22px] font-semibold m-0">Company Details</h1>
            <div className="text-sm text-muted-foreground">This information appears on payslips and MRA CSV.</div>
          </div>
        </div>
        <span className="bg-panel-2 border border-border text-muted-foreground px-2.5 py-2 rounded-[10px] text-xs">
          Editing current company
        </span>
      </header>

      <div className="bg-card border border-border rounded-2xl p-[18px]">
        <p className="text-muted-foreground mb-[18px]">You can edit this anytime.</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-[13px] text-muted-foreground block mb-1.5">Company name <span className="text-destructive">*</span></label>
              <input value={form.name} onChange={e => update("name", e.target.value)} className="w-full px-3 py-3 rounded-[10px] border border-input bg-panel-2 text-foreground" placeholder="e.g. DC Power Pro Ltd" />
            </div>
            <div>
              <label className="text-[13px] text-muted-foreground block mb-1.5">Employer Registration Number (ERN)</label>
              <input value={form.ern} onChange={e => update("ern", e.target.value)} className="w-full px-3 py-3 rounded-[10px] border border-input bg-panel-2 text-foreground" placeholder="e.g. ERN123456" />
              <div className="text-xs text-muted-foreground mt-1.5">You can add this later if you don't have it right now.</div>
            </div>
            <div>
              <label className="text-[13px] text-muted-foreground block mb-1.5">Business Registration Number (BRN)</label>
              <input value={form.brn} onChange={e => update("brn", e.target.value)} className="w-full px-3 py-3 rounded-[10px] border border-input bg-panel-2 text-foreground" placeholder="e.g. C12345678" />
            </div>
            <div>
              <label className="text-[13px] text-muted-foreground block mb-1.5">Registered address</label>
              <textarea value={form.address} onChange={e => update("address", e.target.value)} className="w-full px-3 py-3 rounded-[10px] border border-input bg-panel-2 text-foreground min-h-[90px] resize-y" placeholder="Street, City, Postcode" />
            </div>
            <div>
              <label className="text-[13px] text-muted-foreground block mb-1.5">Director(s)</label>
              <input value={form.directors} onChange={e => update("directors", e.target.value)} className="w-full px-3 py-3 rounded-[10px] border border-input bg-panel-2 text-foreground" placeholder="e.g. Jane Doe, John Lee" />
              <div className="text-xs text-muted-foreground mt-1.5">Separate multiple names with commas.</div>
            </div>
            <div>
              <label className="text-[13px] text-muted-foreground block mb-1.5">Contact email</label>
              <input value={form.contact_email} onChange={e => update("contact_email", e.target.value)} className="w-full px-3 py-3 rounded-[10px] border border-input bg-panel-2 text-foreground" type="email" placeholder="accounts@company.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1.5">Telephone</label>
                <input value={form.phone} onChange={e => update("phone", e.target.value)} className="w-full px-3 py-3 rounded-[10px] border border-input bg-panel-2 text-foreground" placeholder="e.g. 2123456" />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1.5">Mobile</label>
                <input value={form.mobile} onChange={e => update("mobile", e.target.value)} className="w-full px-3 py-3 rounded-[10px] border border-input bg-panel-2 text-foreground" placeholder="e.g. 59999999" />
              </div>
            </div>

            <div className="pt-3">
              <div className="font-semibold mb-2">Payroll Period</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] text-muted-foreground block mb-1.5">Start day (1–31)</label>
                  <select value={form.payroll_start_day} onChange={e => update("payroll_start_day", e.target.value)} className="w-full px-3 py-3 rounded-[10px] border border-input bg-panel-2 text-foreground">
                    {dayOptions.map(d => <option key={d} value={String(d)}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[13px] text-muted-foreground block mb-1.5">End day (1–31)</label>
                  <select value={form.payroll_end_day} onChange={e => update("payroll_end_day", e.target.value)} className="w-full px-3 py-3 rounded-[10px] border border-input bg-panel-2 text-foreground">
                    {dayOptions.map(d => <option key={d} value={String(d)}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                Default payroll window: {form.payroll_start_day} → {form.payroll_end_day}.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1.5">MRA Due day (1–31)</label>
                <select value={form.mra_due_day} onChange={e => update("mra_due_day", e.target.value)} className="w-full px-3 py-3 rounded-[10px] border border-input bg-panel-2 text-foreground">
                  {dayOptions.map(d => <option key={d} value={String(d)}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">We'll show deadlines and status on your dashboard using this date.</div>
          </div>

          <div>
            <label className="text-[13px] text-muted-foreground block mb-1.5">Company logo (optional)</label>
            <div className="flex gap-3 items-center">
              <input type="file" accept="image/*" className="text-sm text-muted-foreground file:mr-2 file:px-3 file:py-2 file:rounded-[10px] file:border file:border-input file:bg-panel-2 file:text-foreground" />
              <div className="h-14 w-14 rounded-[10px] border border-border bg-panel-2 flex items-center justify-center text-2xl">
                🖼️
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1.5">PNG/JPG/WebP. Square works best.</div>

            <div className="bg-panel-2 border border-border rounded-2xl p-4 mt-6">
              <strong>Pro tip</strong>
              <div className="text-xs text-muted-foreground mt-1.5">Save to see your logo and name across the portal.</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 items-center mt-4 flex-wrap">
          <button onClick={handleSave} className="bg-primary text-primary-foreground font-bold px-4 py-3 rounded-xl hover:bg-brand-hover transition-all hover:-translate-y-px">
            Save company profile
          </button>
          <button onClick={() => navigate("/")} className="bg-transparent text-foreground border border-border font-bold px-4 py-3 rounded-xl hover:bg-secondary transition-colors">
            Back to dashboard
          </button>
          {msg && <span className={`text-sm ${msg.includes("Saved") ? "text-primary" : "text-destructive"}`}>{msg}</span>}
        </div>
      </div>

      <div className="mt-5 mb-2 text-center text-muted-foreground text-xs">
        © {new Date().getFullYear()} DC Payroll — All rights reserved.
      </div>
    </div>
  );
};

export default CompanySetup;
