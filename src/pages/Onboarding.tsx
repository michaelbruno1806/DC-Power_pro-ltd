import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Building2,
  CalendarDays,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Download,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import * as XLSX from "xlsx";

type Step = 1 | 2 | 3;

const Onboarding = () => {
  const { user, companyId, company, refreshMeta } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [details, setDetails] = useState({
    name: "",
    brn: "",
    tan: "",
    vat_number: "",
    address: "",
    email: "",
    phone: "",
    logo_url: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Step 2
  const [payroll, setPayroll] = useState({
    payroll_frequency: "monthly",
    payroll_start_month: new Date().toISOString().slice(0, 7), // YYYY-MM
  });

  useEffect(() => {
    if (!companyId) return;
    supabase
      .from("companies")
      .select("name, brn, tan, vat_number, address, email, phone, logo_url, payroll_frequency, payroll_start_month")
      .eq("id", companyId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setDetails((p) => ({
          ...p,
          name: data.name || "",
          brn: data.brn || "",
          tan: (data as any).tan || "",
          vat_number: (data as any).vat_number || "",
          address: data.address || "",
          email: data.email || user?.email || "",
          phone: data.phone || "",
          logo_url: (data as any).logo_url || "",
        }));
        setPayroll({
          payroll_frequency: (data as any).payroll_frequency || "monthly",
          payroll_start_month:
            (data as any).payroll_start_month?.slice(0, 7) || new Date().toISOString().slice(0, 7),
        });
      });
  }, [companyId, user]);

  // Already completed → bounce out
  useEffect(() => {
    if (company?.setup_completed) navigate("/dashboard", { replace: true });
  }, [company, navigate]);

  const upload = async (k: string, v: string) => setDetails((p) => ({ ...p, [k]: v }));

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !companyId) return null;
    const ext = logoFile.name.split(".").pop();
    const path = `${companyId}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("company-logos").upload(path, logoFile, {
      upsert: true,
      contentType: logoFile.type,
    });
    if (error) {
      toast.error(`Logo upload failed: ${error.message}`);
      return null;
    }
    const { data } = supabase.storage.from("company-logos").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveStep1 = async () => {
    if (!details.name.trim()) {
      toast.error("Company name is required");
      return false;
    }
    if (!details.brn.trim() || !details.tan.trim()) {
      toast.error("BRN and TAN are required");
      return false;
    }
    setSaving(true);
    let logo_url = details.logo_url;
    if (logoFile) {
      const uploaded = await uploadLogo();
      if (uploaded) logo_url = uploaded;
    }
    const { error } = await supabase
      .from("companies")
      .update({
        name: details.name.trim(),
        brn: details.brn.trim() || null,
        tan: details.tan.trim() || null,
        vat_number: details.vat_number.trim() || null,
        address: details.address || null,
        email: details.email || null,
        phone: details.phone || null,
        logo_url: logo_url || null,
      } as any)
      .eq("id", companyId!);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return false;
    }
    setDetails((p) => ({ ...p, logo_url }));
    return true;
  };

  const saveStep2 = async () => {
    setSaving(true);
    const startDate = `${payroll.payroll_start_month}-01`;
    const { error } = await supabase
      .from("companies")
      .update({
        payroll_frequency: payroll.payroll_frequency,
        payroll_start_month: startDate,
        currency: "MUR",
      } as any)
      .eq("id", companyId!);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return false;
    }
    return true;
  };

  const finish = async (mode: "manual" | "import") => {
    setSaving(true);
    // Mark setup complete
    const { error } = await supabase
      .from("companies")
      .update({ setup_completed: true } as any)
      .eq("id", companyId!);
    if (error) {
      setSaving(false);
      toast.error(error.message);
      return;
    }

    // Create first payroll period from start month
    const [y, m] = payroll.payroll_start_month.split("-").map(Number);
    await supabase.from("payroll_files").insert({
      company_id: companyId!,
      year: y,
      month: m,
      status: "draft",
      created_by: user!.id,
    } as any);

    await refreshMeta();
    setSaving(false);
    toast.success("Setup complete! Welcome to DC Payroll.");
    navigate("/employees");
    if (mode === "import") {
      // small UX hint
      setTimeout(() => toast.info("Use the bulk import button on Employees page."), 600);
    }
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "first_name",
        "last_name",
        "email",
        "phone",
        "nic",
        "date_of_birth",
        "gender",
        "employment_date",
        "basic_salary",
        "bank_name",
        "bank_account",
        "address",
      ],
      [
        "John",
        "Doe",
        "john@company.com",
        "5xxxxxxx",
        "D1234567890123A",
        "1990-01-15",
        "male",
        "2024-01-01",
        "25000",
        "MCB",
        "000123456789",
        "10 Royal Street, Port Louis",
      ],
    ]);
    ws["!cols"] = Array(12).fill({ wch: 18 });
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "dc-payroll-employee-template.xlsx");
  };

  const next = async () => {
    if (step === 1 && !(await saveStep1())) return;
    if (step === 2 && !(await saveStep2())) return;
    setStep((s) => Math.min(3, s + 1) as Step);
  };
  const back = () => setStep((s) => Math.max(1, s - 1) as Step);

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 animate-fade-up">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-lg mb-3"
            style={{ background: "var(--gradient-emerald)" }}
          >
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-medium text-foreground">
            Set up your workspace
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            A few details to get your payroll running.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between max-w-lg mx-auto mb-8">
          {[
            { n: 1, label: "Company", icon: Building2 },
            { n: 2, label: "Payroll", icon: CalendarDays },
            { n: 3, label: "Employees", icon: Users },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                    step >= s.n
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {step > s.n ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span
                  className={`text-[11px] uppercase tracking-wider mt-2 font-medium ${
                    step >= s.n ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`h-px flex-1 mx-2 transition-all ${
                    step > s.n ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="premium-card p-7 animate-fade-up">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-medium text-foreground mb-2">
                Company Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Company Name *" value={details.name} onChange={(v) => upload("name", v)} />
                <FormField label="BRN *" value={details.brn} onChange={(v) => upload("brn", v)} placeholder="C12345678" />
                <FormField label="TAN *" value={details.tan} onChange={(v) => upload("tan", v)} placeholder="TAN12345678" />
                <FormField label="VAT Number (optional)" value={details.vat_number} onChange={(v) => upload("vat_number", v)} />
                <FormField label="Company Email" value={details.email} onChange={(v) => upload("email", v)} className="col-span-2" />
                <FormField label="Phone" value={details.phone} onChange={(v) => upload("phone", v)} />
                <FormField label="Address" value={details.address} onChange={(v) => upload("address", v)} />
              </div>
              <div className="space-y-2 pt-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Company Logo
                </Label>
                <div className="flex items-center gap-3">
                  {(logoFile || details.logo_url) && (
                    <img
                      src={logoFile ? URL.createObjectURL(logoFile) : details.logo_url}
                      alt="Logo"
                      className="h-14 w-14 rounded-md object-cover border border-border"
                    />
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm hover:bg-secondary/50">
                      <Upload className="h-4 w-4" /> Upload logo
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-medium text-foreground mb-2">
                Payroll Settings
              </h2>
              <div className="space-y-2">
                <Label>Payroll Frequency</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["monthly", "fortnightly", "weekly"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setPayroll((p) => ({ ...p, payroll_frequency: f }))}
                      className={`px-4 py-3 rounded-md border text-sm capitalize transition-all ${
                        payroll.payroll_frequency === f
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payroll Start Month</Label>
                <Input
                  type="month"
                  value={payroll.payroll_start_month}
                  onChange={(e) =>
                    setPayroll((p) => ({ ...p, payroll_start_month: e.target.value }))
                  }
                  className="bg-secondary/40 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value="MUR · Mauritian Rupee" disabled className="bg-secondary/40 h-11" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-medium text-foreground mb-2">
                Add your employees
              </h2>
              <p className="text-sm text-muted-foreground">
                You can add them now or anytime from the Employees page.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => finish("manual")}
                  disabled={saving}
                  className="text-left p-5 rounded-lg border border-border hover:border-primary/50 transition-all bg-secondary/20"
                >
                  <Users className="h-7 w-7 text-primary mb-3" />
                  <div className="font-medium text-foreground">Add manually</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    One by one, in the Employees page.
                  </div>
                </button>
                <button
                  onClick={() => finish("import")}
                  disabled={saving}
                  className="text-left p-5 rounded-lg border border-border hover:border-primary/50 transition-all bg-secondary/20"
                >
                  <FileSpreadsheet className="h-7 w-7 text-primary mb-3" />
                  <div className="font-medium text-foreground">Import from Excel</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Upload our template to add many at once.
                  </div>
                </button>
              </div>

              <Button onClick={downloadTemplate} variant="outline" className="gap-2 w-full">
                <Download className="h-4 w-4" /> Download Excel template
              </Button>
            </div>
          )}

          {/* Footer nav */}
          {step !== 3 && (
            <div className="flex justify-between items-center mt-7 pt-5 border-t border-border">
              <Button onClick={back} variant="ghost" disabled={step === 1 || saving} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                onClick={next}
                disabled={saving}
                className="gap-2"
                style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}
              >
                {saving ? "Saving…" : "Continue"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) => (
  <div className={`space-y-1.5 ${className || ""}`}>
    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
      {label}
    </Label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-secondary/40 h-11"
    />
  </div>
);

export default Onboarding;
