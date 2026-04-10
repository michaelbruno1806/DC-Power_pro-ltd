import { useLocation } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { FileText, CheckSquare, BarChart3, Palmtree, Clock, PartyPopper } from "lucide-react";

const pageTitles: Record<string, { title: string; icon: any; desc: string }> = {
  "/payslips": { title: "Payslips", icon: FileText, desc: "Generate and send payslips to employees." },
  "/checklist": { title: "Checklist", icon: CheckSquare, desc: "Track your monthly payroll checklist." },
  "/mra-filings": { title: "MRA Filings", icon: BarChart3, desc: "File and track MRA submissions." },
  "/leaves": { title: "Leaves", icon: Palmtree, desc: "Track and approve employee leave requests." },
  "/working-days": { title: "Working Days & Hours", icon: Clock, desc: "Configure working days and hours per period." },
  "/holidays": { title: "Holidays", icon: PartyPopper, desc: "Manage public holidays for payroll calculations." },
};

const PlaceholderPage = () => {
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: "Page", icon: FileText, desc: "Coming soon." };
  const Icon = page.icon;

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <GlassCard elevated className="text-center py-12">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{page.title}</h1>
        <p className="text-muted-foreground mb-6">{page.desc}</p>
        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary font-medium text-sm px-4 py-2 rounded-full">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Coming Soon
        </span>
      </GlassCard>
    </div>
  );
};

export default PlaceholderPage;
