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
    <div className="max-w-2xl mx-auto mt-16 animate-fade-up">
      <GlassCard elevated className="text-center py-16 border-primary/10">
        <div
          className="h-16 w-16 rounded-lg flex items-center justify-center mx-auto mb-6"
          style={{ background: "var(--gradient-emerald)", boxShadow: "var(--shadow-glow)" }}
        >
          <Icon className="h-7 w-7 text-primary-foreground" />
        </div>
        <div className="eyebrow mb-3">In Development</div>
        <h1 className="heading-display text-foreground mb-3">{page.title}</h1>
        <div className="divider-elegant mx-auto mb-5" />
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">{page.desc}</p>
        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 font-medium text-xs uppercase tracking-wider px-4 py-2 rounded-full mt-8">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Coming Soon
        </span>
      </GlassCard>
    </div>
  );
};

export default PlaceholderPage;
