-- Round 1: Roles, Trial, Wizard foundations

-- 1) Extend app_role enum (cannot use new values in this same migration)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'company_owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'payroll_officer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hr_user';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'accountant';

-- 2) Companies: trial + setup wizard + new regulatory fields
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS setup_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payroll_frequency text DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS payroll_start_month date,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'MUR',
  ADD COLUMN IF NOT EXISTS tan text,
  ADD COLUMN IF NOT EXISTS vat_number text,
  ADD COLUMN IF NOT EXISTS logo_url text;

-- 3) Profiles: phone + full_name
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS full_name text;

-- 4) user_roles: optional company scope (for future per-company roles)
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS company_id uuid;

-- 5) Accountant ↔ Company multi-link table
CREATE TABLE IF NOT EXISTS public.accountant_company_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_user_id uuid NOT NULL,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (accountant_user_id, company_id)
);
ALTER TABLE public.accountant_company_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Accountant can view own links" ON public.accountant_company_links;
CREATE POLICY "Accountant can view own links" ON public.accountant_company_links
  FOR SELECT USING (auth.uid() = accountant_user_id);

DROP POLICY IF EXISTS "Super admins manage accountant links" ON public.accountant_company_links;
CREATE POLICY "Super admins manage accountant links" ON public.accountant_company_links
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Company admin manage own accountant links" ON public.accountant_company_links;
CREATE POLICY "Company admin manage own accountant links" ON public.accountant_company_links
  FOR ALL USING (company_id = public.get_user_company_id(auth.uid()));

-- 6) Storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read company logos" ON storage.objects;
CREATE POLICY "Public read company logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated upload company logos" ON storage.objects;
CREATE POLICY "Authenticated upload company logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated update company logos" ON storage.objects;
CREATE POLICY "Authenticated update company logos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated delete company logos" ON storage.objects;
CREATE POLICY "Authenticated delete company logos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'company-logos');

-- 7) Update handle_new_user trigger: create profile + auto-create company + assign role + start 14-day trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id uuid;
  v_full_name text;
  v_phone text;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', NEW.email);
  v_phone := NEW.raw_user_meta_data->>'phone';

  -- Create empty company with 14-day trial
  INSERT INTO public.companies (name, trial_ends_at, subscription_status, setup_completed, currency)
  VALUES ('My Company', now() + interval '14 days', 'trial', false, 'MUR')
  RETURNING id INTO new_company_id;

  -- Create profile linked to that company
  INSERT INTO public.profiles (user_id, display_name, full_name, phone, company_id)
  VALUES (NEW.id, v_full_name, v_full_name, v_phone, new_company_id);

  -- Assign company_owner role (cast literal to enum)
  INSERT INTO public.user_roles (user_id, role, company_id)
  VALUES (NEW.id, 'company_owner'::public.app_role, new_company_id);

  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8) Backfill: existing companies without trial get 14-day trial from now (so existing users keep working)
UPDATE public.companies
SET trial_ends_at = COALESCE(trial_ends_at, now() + interval '14 days'),
    subscription_status = COALESCE(subscription_status, 'trial'),
    setup_completed = COALESCE(setup_completed, true)  -- existing companies treated as already set up
WHERE trial_ends_at IS NULL;

-- 9) Helper function: is company active (trial not expired OR active subscription)
CREATE OR REPLACE FUNCTION public.is_company_active(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = _company_id
      AND (
        subscription_status = 'active'
        OR (subscription_status = 'trial' AND trial_ends_at > now())
      )
  )
$$;