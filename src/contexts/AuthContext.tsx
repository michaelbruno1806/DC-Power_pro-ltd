import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole =
  | "super_admin"
  | "client_admin"
  | "company_owner"
  | "payroll_officer"
  | "hr_user"
  | "accountant"
  | null;

interface CompanyMeta {
  setup_completed: boolean;
  subscription_status: string | null;
  trial_ends_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole;
  companyId: string | null;
  displayName: string | null;
  emailVerified: boolean;
  company: CompanyMeta | null;
  trialDaysRemaining: number | null;
  isActive: boolean;
  refreshMeta: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: null,
  companyId: null,
  displayName: null,
  emailVerified: false,
  company: null,
  trialDaysRemaining: null,
  isActive: false,
  refreshMeta: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyMeta | null>(null);

  const fetchUserMeta = async (userId: string) => {
    const [rolesRes, profileRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).limit(1).maybeSingle(),
      supabase
        .from("profiles")
        .select("company_id, display_name, full_name")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle(),
    ]);

    if (rolesRes.data) setRole(rolesRes.data.role as AppRole);
    if (profileRes.data) {
      setCompanyId(profileRes.data.company_id);
      const name = (profileRes.data as any).full_name || profileRes.data.display_name;
      if (name) setDisplayName(name);

      if (profileRes.data.company_id) {
        const { data: c } = await supabase
          .from("companies")
          .select("setup_completed, subscription_status, trial_ends_at")
          .eq("id", profileRes.data.company_id)
          .maybeSingle();
        if (c) setCompany(c as any);
      }
    }
  };

  const refreshMeta = async () => {
    if (user?.id) await fetchUserMeta(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const meta = session.user.user_metadata as any;
          setDisplayName(
            meta?.full_name || meta?.display_name || meta?.name || session.user.email || null
          );
          setTimeout(() => fetchUserMeta(session.user.id), 0);
        } else {
          setRole(null);
          setCompanyId(null);
          setDisplayName(null);
          setCompany(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const meta = session.user.user_metadata as any;
        setDisplayName(
          meta?.full_name || meta?.display_name || meta?.name || session.user.email || null
        );
        fetchUserMeta(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setCompanyId(null);
    setDisplayName(null);
    setCompany(null);
  };

  const emailVerified = !!user?.email_confirmed_at || !!(user as any)?.confirmed_at;

  const trialDaysRemaining = (() => {
    if (!company?.trial_ends_at) return null;
    const ms = new Date(company.trial_ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  })();

  const isActive =
    company?.subscription_status === "active" ||
    (company?.subscription_status === "trial" && (trialDaysRemaining ?? 0) > 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        companyId,
        displayName,
        emailVerified,
        company,
        trialDaysRemaining,
        isActive,
        refreshMeta,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
