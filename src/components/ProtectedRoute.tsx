import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  /** If true, this route is reachable even when setup is not yet completed */
  allowSetup?: boolean;
  /** If true, this route is reachable even when email isn't verified yet */
  allowUnverified?: boolean;
}

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div
        className="h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-foreground animate-glow-pulse"
        style={{ background: "var(--gradient-brand)" }}
      >
        DC
      </div>
      <div className="animate-spin h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full" />
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowSetup, allowUnverified }: Props) => {
  const { user, loading, emailVerified, company, role } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;

  // Email verification gate (super admins skip)
  if (!emailVerified && role !== "super_admin" && !allowUnverified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Setup wizard gate — only the wizard route allows this
  if (
    role !== "super_admin" &&
    company &&
    !company.setup_completed &&
    !allowSetup
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
