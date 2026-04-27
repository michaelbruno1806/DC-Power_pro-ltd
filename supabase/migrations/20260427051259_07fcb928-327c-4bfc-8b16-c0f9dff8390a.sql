
-- ============================================================
-- LEAVE TYPES
-- ============================================================
CREATE TABLE public.leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT true,
  annual_entitlement_days NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client admins manage own leave types"
  ON public.leave_types FOR ALL
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Super admins manage all leave types"
  ON public.leave_types FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_leave_types_updated
  BEFORE UPDATE ON public.leave_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- LEAVE REQUESTS
-- ============================================================
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  leave_type_id UUID,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  approved_by UUID,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leave_requests_company ON public.leave_requests(company_id);
CREATE INDEX idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_requests_period ON public.leave_requests(start_date, end_date);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client admins manage own leave requests"
  ON public.leave_requests FOR ALL
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Super admins manage all leave requests"
  ON public.leave_requests FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_leave_requests_updated
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Status validation via trigger (CHECK with text could be acceptable but we keep it flexible)
CREATE OR REPLACE FUNCTION public.validate_leave_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending','approved','rejected','cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  IF NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'end_date cannot be before start_date';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_leave_requests_validate
  BEFORE INSERT OR UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_leave_status();

-- ============================================================
-- PUBLIC HOLIDAYS
-- ============================================================
CREATE TABLE public.public_holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  holiday_date DATE NOT NULL,
  name TEXT NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, holiday_date, name)
);

CREATE INDEX idx_public_holidays_company_date ON public.public_holidays(company_id, holiday_date);

ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client admins manage own holidays"
  ON public.public_holidays FOR ALL
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Super admins manage all holidays"
  ON public.public_holidays FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_public_holidays_updated
  BEFORE UPDATE ON public.public_holidays
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- WORKING DAY CONFIGS
-- ============================================================
CREATE TABLE public.working_day_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER, -- NULL = company default for the year
  working_days INTEGER NOT NULL DEFAULT 22,
  hours_per_week NUMERIC NOT NULL DEFAULT 45,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, year, month)
);

ALTER TABLE public.working_day_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client admins manage own working day configs"
  ON public.working_day_configs FOR ALL
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Super admins manage all working day configs"
  ON public.working_day_configs FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_working_day_configs_updated
  BEFORE UPDATE ON public.working_day_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Seed default leave types for each existing company
-- ============================================================
INSERT INTO public.leave_types (company_id, name, code, is_paid, annual_entitlement_days)
SELECT c.id, lt.name, lt.code, lt.is_paid, lt.entitlement
FROM public.companies c
CROSS JOIN (VALUES
  ('Annual','ANN', true, 22),
  ('Sick','SICK', true, 15),
  ('Unpaid','UNPAID', false, NULL::int),
  ('Maternity','MAT', true, 98),
  ('Paternity','PAT', true, 5)
) AS lt(name, code, is_paid, entitlement)
ON CONFLICT (company_id, name) DO NOTHING;
