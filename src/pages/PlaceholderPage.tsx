import { useLocation } from "react-router-dom";

const pageTitles: Record<string, { title: string; icon: string; desc: string }> = {
  "/payroll": { title: "Payroll Files", icon: "📁", desc: "Upload and manage payroll data for each period." },
  "/payslips": { title: "Payslips", icon: "🧾", desc: "Generate and send payslips to employees." },
  "/checklist": { title: "Checklist", icon: "✅", desc: "Track your monthly payroll checklist." },
  "/mra-filings": { title: "MRA Filings", icon: "📊", desc: "File and track MRA submissions." },
  "/employees": { title: "Employees", icon: "👥", desc: "Manage employee records and details." },
  "/leaves": { title: "Leaves", icon: "🌴", desc: "Track and approve employee leave requests." },
  "/working-days": { title: "Working Days & Hours", icon: "🕒", desc: "Configure working days and hours per period." },
  "/holidays": { title: "Holidays", icon: "🎉", desc: "Manage public holidays for payroll calculations." },
};

const PlaceholderPage = () => {
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: "Page", icon: "📄", desc: "Coming soon." };

  return (
    <div className="max-w-[800px] mx-auto mt-8">
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">{page.icon}</div>
        <h1 className="text-2xl font-bold mb-2">{page.title}</h1>
        <p className="text-muted-foreground">{page.desc}</p>
        <div className="mt-6 inline-block bg-primary/15 text-primary font-semibold text-sm px-4 py-2 rounded-full">
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
