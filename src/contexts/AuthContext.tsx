import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "super_admin" | "client_admin" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole;
  companyId: string | null;
  displayName: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: null,
  companyId: null,
  displayName: null,
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

  const fetchUserMeta = async (userId: string) => {
    const [rolesRes, profileRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).limit(1).single(),
      supabase.from("profiles").select("company_id, display_name").eq("user_id", userId).limit(1).single(),
    ]);

    if (rolesRes.data) setRole(rolesRes.data.role as AppRole);
    if (profileRes.data) {
      setCompanyId(profileRes.data.company_id);
      if (profileRes.data.display_name) setDisplayName(profileRes.data.display_name);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Optimistic name from auth metadata so the UI never shows blank
          const meta = session.user.user_metadata as any;
          setDisplayName(meta?.display_name || meta?.full_name || meta?.name || session.user.email || null);
          setTimeout(() => fetchUserMeta(session.user.id), 0);
        } else {
          setRole(null);
          setCompanyId(null);
          setDisplayName(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const meta = session.user.user_metadata as any;
        setDisplayName(meta?.display_name || meta?.full_name || meta?.name || session.user.email || null);
        fetchUserMeta(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
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
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role, companyId, displayName, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
