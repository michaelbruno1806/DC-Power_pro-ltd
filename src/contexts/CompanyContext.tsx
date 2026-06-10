import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface AccessibleCompany {
  id: string;
  name: string;
  isOwn: boolean;
  role: "owner" | "accountant_view" | "accountant_manage";
}

interface CompanyCtx {
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string) => void;
  companies: AccessibleCompany[];
  loading: boolean;
  refresh: () => Promise<void>;
  canManage: boolean;
}

const Ctx = createContext<CompanyCtx>({
  activeCompanyId: null,
  setActiveCompanyId: () => {},
  companies: [],
  loading: true,
  refresh: async () => {},
  canManage: true,
});

export const useActiveCompany = () => useContext(Ctx);

const STORAGE_KEY = "dc_active_company";

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const { user, companyId } = useAuth();
  const [companies, setCompanies] = useState<AccessibleCompany[]>([]);
  const [activeCompanyId, setActiveCompanyIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setCompanies([]);
      setActiveCompanyIdState(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    const list: AccessibleCompany[] = [];
    if (companyId) {
      const { data } = await supabase.from("companies").select("id, name").eq("id", companyId).maybeSingle();
      if (data) list.push({ id: data.id, name: data.name || "My Company", isOwn: true, role: "owner" });
    }

    const { data: links } = await supabase
      .from("accountant_company_links")
      .select("company_id, role, companies(name)")
      .eq("accountant_user_id", user.id);
    (links || []).forEach((l: any) => {
      if (!list.find(c => c.id === l.company_id)) {
        list.push({
          id: l.company_id,
          name: l.companies?.name || "Client company",
          isOwn: false,
          role: l.role === "manage" ? "accountant_manage" : "accountant_view",
        });
      }
    });
    setCompanies(list);

    const stored = localStorage.getItem(`${STORAGE_KEY}:${user.id}`);
    const chosen = (stored && list.find(c => c.id === stored)?.id) || list[0]?.id || null;
    setActiveCompanyIdState(chosen);
    setLoading(false);
  }, [user, companyId]);

  useEffect(() => { load(); }, [load]);

  const setActiveCompanyId = (id: string) => {
    if (user) localStorage.setItem(`${STORAGE_KEY}:${user.id}`, id);
    setActiveCompanyIdState(id);
  };

  const active = companies.find(c => c.id === activeCompanyId);
  const canManage = !active || active.role !== "accountant_view";

  return (
    <Ctx.Provider value={{ activeCompanyId, setActiveCompanyId, companies, loading, refresh: load, canManage }}>
      {children}
    </Ctx.Provider>
  );
};
