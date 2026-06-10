import { useActiveCompany } from "@/contexts/CompanyContext";
import { Check, Building2, ChevronDown, Briefcase } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const CompanySwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { companies, activeCompanyId, setActiveCompanyId, loading } = useActiveCompany();
  if (loading || companies.length === 0) return null;
  const active = companies.find(c => c.id === activeCompanyId);
  if (companies.length === 1) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/40 border border-border text-xs">
        <Building2 className="h-3.5 w-3.5 text-primary" />
        <span className="truncate text-foreground">{active?.name}</span>
      </div>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/60 border border-border hover:border-primary/40 transition text-xs w-full">
        {active?.isOwn ? <Building2 className="h-3.5 w-3.5 text-primary" /> : <Briefcase className="h-3.5 w-3.5 text-primary" />}
        <span className="truncate flex-1 text-left text-foreground font-medium">{active?.name || "Select"}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-card border-border">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Active company</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map(c => (
          <DropdownMenuItem
            key={c.id}
            onClick={() => setActiveCompanyId(c.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {c.isOwn ? <Building2 className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
            <div className="flex-1 truncate">
              <div className="text-sm">{c.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {c.isOwn ? "Owner" : c.role === "accountant_manage" ? "Accountant · Manage" : "Accountant · View"}
              </div>
            </div>
            {c.id === activeCompanyId && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CompanySwitcher;
