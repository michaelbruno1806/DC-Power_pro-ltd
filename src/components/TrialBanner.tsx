import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Sparkles, AlertTriangle } from "lucide-react";

const TrialBanner = () => {
  const { company, trialDaysRemaining, isActive } = useAuth();
  if (!company) return null;
  if (company.subscription_status === "active") return null;

  const expired = (trialDaysRemaining ?? 0) <= 0;

  return (
    <div
      className={`rounded-lg border p-4 flex items-center justify-between gap-4 ${
        expired
          ? "border-destructive/40 bg-destructive/10"
          : "border-primary/30 bg-primary/5"
      }`}
    >
      <div className="flex items-center gap-3">
        {expired ? (
          <AlertTriangle className="h-5 w-5 text-destructive" />
        ) : (
          <Sparkles className="h-5 w-5 text-primary" />
        )}
        <div>
          <div className="text-sm font-medium text-foreground">
            {expired
              ? "Your free trial has ended"
              : `${trialDaysRemaining} day${trialDaysRemaining === 1 ? "" : "s"} remaining in your trial`}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {expired
              ? "Payroll processing is paused until you subscribe."
              : "Upgrade anytime to keep full access."}
          </div>
        </div>
      </div>
      <Link
        to="/pricing"
        className="px-4 py-2 rounded-md text-sm font-medium text-primary-foreground"
        style={{ background: "var(--gradient-emerald)" }}
      >
        {expired ? "Subscribe now" : "Upgrade"}
      </Link>
    </div>
  );
};

export default TrialBanner;
