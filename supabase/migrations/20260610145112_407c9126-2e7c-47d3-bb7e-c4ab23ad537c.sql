
-- ===== 1. ACCOUNTANT LINKS =====
ALTER TABLE public.accountant_company_links
  ALTER COLUMN accountant_user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS invite_email text,
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'view' CHECK (role IN ('view','manage')),
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_acl_invite_email ON public.accountant_company_links (lower(invite_email));
CREATE INDEX IF NOT EXISTS idx_acl_accountant ON public.accountant_company_links (accountant_user_id);

-- Allow an accountant whose email matches a pending invite to see it
DROP POLICY IF EXISTS "Invitees can view pending invites" ON public.accountant_company_links;
CREATE POLICY "Invitees can view pending invites"
ON public.accountant_company_links FOR SELECT TO authenticated
USING (
  accountant_user_id IS NULL
  AND invite_email IS NOT NULL
  AND lower(invite_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- ===== 2. ACCESS HELPERS =====
CREATE OR REPLACE FUNCTION public.can_access_company(_user uuid, _company uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = _user AND company_id = _company
  ) OR EXISTS (
    SELECT 1 FROM public.accountant_company_links
    WHERE accountant_user_id = _user AND company_id = _company
  ) OR public.has_role(_user, 'super_admin'::public.app_role);
$$;

CREATE OR REPLACE FUNCTION public.can_manage_company(_user uuid, _company uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = _user AND company_id = _company
  ) OR EXISTS (
    SELECT 1 FROM public.accountant_company_links
    WHERE accountant_user_id = _user AND company_id = _company AND role = 'manage'
  ) OR public.has_role(_user, 'super_admin'::public.app_role);
$$;

CREATE OR REPLACE FUNCTION public.get_accessible_company_ids(_user uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.profiles WHERE user_id = _user AND company_id IS NOT NULL
  UNION
  SELECT company_id FROM public.accountant_company_links WHERE accountant_user_id = _user;
$$;

-- ===== 3. ACCOUNTANT POLICIES (additive, do not remove existing) =====
-- companies
DROP POLICY IF EXISTS "Accountants can view linked companies" ON public.companies;
CREATE POLICY "Accountants can view linked companies"
ON public.companies FOR SELECT TO authenticated
USING (public.can_access_company(auth.uid(), id));

DROP POLICY IF EXISTS "Accountants can manage linked companies" ON public.companies;
CREATE POLICY "Accountants can manage linked companies"
ON public.companies FOR UPDATE TO authenticated
USING (public.can_manage_company(auth.uid(), id))
WITH CHECK (public.can_manage_company(auth.uid(), id));

-- helper macro pattern via individual policies
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'employees','payroll_files','leave_types','leave_requests',
    'public_holidays','working_day_configs','payroll_components','company_directors'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Accountants view %1$s" ON public.%1$I;', t);
    EXECUTE format('CREATE POLICY "Accountants view %1$s" ON public.%1$I FOR SELECT TO authenticated USING (public.can_access_company(auth.uid(), company_id));', t);
    EXECUTE format('DROP POLICY IF EXISTS "Accountants manage %1$s" ON public.%1$I;', t);
    EXECUTE format('CREATE POLICY "Accountants manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.can_manage_company(auth.uid(), company_id)) WITH CHECK (public.can_manage_company(auth.uid(), company_id));', t);
  END LOOP;
END $$;

-- payroll_entries (joined via payroll_files.company_id)
DROP POLICY IF EXISTS "Accountants view payroll_entries" ON public.payroll_entries;
CREATE POLICY "Accountants view payroll_entries"
ON public.payroll_entries FOR SELECT TO authenticated
USING (payroll_file_id IN (
  SELECT id FROM public.payroll_files WHERE public.can_access_company(auth.uid(), company_id)
));
DROP POLICY IF EXISTS "Accountants manage payroll_entries" ON public.payroll_entries;
CREATE POLICY "Accountants manage payroll_entries"
ON public.payroll_entries FOR ALL TO authenticated
USING (payroll_file_id IN (
  SELECT id FROM public.payroll_files WHERE public.can_manage_company(auth.uid(), company_id)
))
WITH CHECK (payroll_file_id IN (
  SELECT id FROM public.payroll_files WHERE public.can_manage_company(auth.uid(), company_id)
));

-- ===== 4. AUTO-LINK INVITES ON SIGNUP =====
CREATE OR REPLACE FUNCTION public.resolve_accountant_invites()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.accountant_company_links
  SET accountant_user_id = NEW.id, accepted_at = now()
  WHERE accountant_user_id IS NULL
    AND lower(invite_email) = lower(NEW.email);

  -- If this user got any links, also tag them as accountant role
  IF EXISTS (SELECT 1 FROM public.accountant_company_links WHERE accountant_user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role, company_id)
    VALUES (NEW.id, 'accountant'::public.app_role, NULL)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_resolve_accountant_invites ON auth.users;
CREATE TRIGGER trg_resolve_accountant_invites
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.resolve_accountant_invites();

-- ===== 5. LEAVE BALANCES =====
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id uuid NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year integer NOT NULL,
  opening_balance numeric(8,2) NOT NULL DEFAULT 0,
  accrued numeric(8,2) NOT NULL DEFAULT 0,
  taken numeric(8,2) NOT NULL DEFAULT 0,
  adjustments numeric(8,2) NOT NULL DEFAULT 0,
  closing_balance numeric(8,2) NOT NULL DEFAULT 0,
  december_payout_days numeric(8,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, leave_type_id, year)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_balances TO authenticated;
GRANT ALL ON public.leave_balances TO service_role;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own/linked leave_balances"
ON public.leave_balances FOR SELECT TO authenticated
USING (public.can_access_company(auth.uid(), company_id));

CREATE POLICY "Manage own/linked leave_balances"
ON public.leave_balances FOR ALL TO authenticated
USING (public.can_manage_company(auth.uid(), company_id))
WITH CHECK (public.can_manage_company(auth.uid(), company_id));

CREATE TRIGGER trg_leave_balances_updated BEFORE UPDATE ON public.leave_balances
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== 6. RECALCULATE FUNCTIONS =====
CREATE OR REPLACE FUNCTION public.recalculate_leave_balance(
  _employee uuid, _type uuid, _year integer
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_company uuid;
  v_hire date;
  v_entitlement numeric;
  v_type_name text;
  v_cumulate boolean;
  v_payout_dec boolean;
  v_sick_reset boolean;
  v_year_start date;
  v_year_end date;
  v_accrual_start date;
  v_months numeric;
  v_accrued numeric;
  v_opening numeric := 0;
  v_taken numeric;
  v_prev_closing numeric;
  v_payout numeric := 0;
  v_closing numeric;
BEGIN
  SELECT e.company_id, e.employment_date, lt.annual_entitlement_days, lt.name
    INTO v_company, v_hire, v_entitlement, v_type_name
  FROM public.employees e
  JOIN public.leave_types lt ON lt.id = _type
  WHERE e.id = _employee;

  IF v_company IS NULL OR v_entitlement IS NULL THEN RETURN; END IF;

  SELECT COALESCE(local_leave_cumulate, true),
         COALESCE(local_leave_payout_december, false),
         COALESCE(sick_leave_reset_january, false)
    INTO v_cumulate, v_payout_dec, v_sick_reset
  FROM public.companies WHERE id = v_company;

  v_year_start := make_date(_year, 1, 1);
  v_year_end := make_date(_year, 12, 31);
  v_accrual_start := GREATEST(v_year_start, COALESCE(v_hire, v_year_start));
  v_months := GREATEST(0, EXTRACT(YEAR FROM age(v_year_end, v_accrual_start)) * 12 + EXTRACT(MONTH FROM age(v_year_end, v_accrual_start)) + 1);
  IF v_months > 12 THEN v_months := 12; END IF;
  v_accrued := ROUND((v_entitlement / 12.0) * v_months, 2);

  -- Opening balance from prior year
  SELECT closing_balance INTO v_prev_closing
  FROM public.leave_balances
  WHERE employee_id = _employee AND leave_type_id = _type AND year = _year - 1;

  IF v_prev_closing IS NOT NULL THEN
    -- Apply reset rules
    IF lower(v_type_name) LIKE '%sick%' AND v_sick_reset THEN
      v_opening := 0;
    ELSIF lower(v_type_name) LIKE '%local%' AND NOT v_cumulate THEN
      v_opening := 0;
    ELSE
      v_opening := v_prev_closing;
    END IF;
  END IF;

  -- Taken: sum approved leaves overlapping the year
  SELECT COALESCE(SUM(days), 0) INTO v_taken
  FROM public.leave_requests
  WHERE employee_id = _employee AND leave_type_id = _type AND status = 'approved'
    AND start_date <= v_year_end AND end_date >= v_year_start;

  v_closing := v_opening + v_accrued - v_taken;

  -- December payout for local leave
  IF lower(v_type_name) LIKE '%local%' AND v_payout_dec AND v_closing > 0 THEN
    v_payout := v_closing;
  END IF;

  INSERT INTO public.leave_balances (company_id, employee_id, leave_type_id, year, opening_balance, accrued, taken, closing_balance, december_payout_days)
  VALUES (v_company, _employee, _type, _year, v_opening, v_accrued, v_taken, v_closing, v_payout)
  ON CONFLICT (employee_id, leave_type_id, year)
  DO UPDATE SET
    opening_balance = EXCLUDED.opening_balance,
    accrued = EXCLUDED.accrued,
    taken = EXCLUDED.taken,
    closing_balance = EXCLUDED.closing_balance,
    december_payout_days = EXCLUDED.december_payout_days,
    updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION public.recalculate_company_balances(_company uuid, _year integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT e.id AS emp, lt.id AS typ
    FROM public.employees e
    CROSS JOIN public.leave_types lt
    WHERE e.company_id = _company AND lt.company_id = _company
      AND e.status = 'active' AND lt.is_active = true
      AND lt.annual_entitlement_days IS NOT NULL
  LOOP
    PERFORM public.recalculate_leave_balance(r.emp, r.typ, _year);
  END LOOP;
END $$;

-- Trigger to refresh balance when a leave changes
CREATE OR REPLACE FUNCTION public.refresh_balance_on_leave_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_year integer;
BEGIN
  v_year := EXTRACT(YEAR FROM COALESCE(NEW.start_date, OLD.start_date));
  IF COALESCE(NEW.leave_type_id, OLD.leave_type_id) IS NOT NULL THEN
    PERFORM public.recalculate_leave_balance(
      COALESCE(NEW.employee_id, OLD.employee_id),
      COALESCE(NEW.leave_type_id, OLD.leave_type_id),
      v_year
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS trg_leave_change_refresh_balance ON public.leave_requests;
CREATE TRIGGER trg_leave_change_refresh_balance
AFTER INSERT OR UPDATE OR DELETE ON public.leave_requests
FOR EACH ROW EXECUTE FUNCTION public.refresh_balance_on_leave_change();
