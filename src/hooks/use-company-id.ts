import { useAuth } from "@/contexts/AuthContext";
import { useActiveCompany } from "@/contexts/CompanyContext";

/**
 * Returns the company id the user is currently operating on.
 * For owners this is their own company; for accountants it's the
 * one selected via the CompanySwitcher.
 */
export const useCompanyId = (): string | null => {
  const { companyId } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  return activeCompanyId || companyId;
};
