-- Round 2: Company v2 + Employee v2

-- Company toggles & extended metadata
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS local_leave_cumulate boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS local_leave_payout_december boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sick_leave_reset_january boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS accountant_email text,
  ADD COLUMN IF NOT EXISTS accountant_name text;

-- Multiple directors
CREATE TABLE IF NOT EXISTS public.company_directors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  full_name text NOT NULL,
  nic text,
  email text,
  phone text,
  role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.company_directors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins manage own directors" ON public.company_directors
  FOR ALL USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Super admins manage all directors" ON public.company_directors
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER trg_company_directors_updated
  BEFORE UPDATE ON public.company_directors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Employee v2 fields
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS employee_code text,
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS employment_type text DEFAULT 'permanent',
  ADD COLUMN IF NOT EXISTS transport_allowance numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS edf_form_url text,
  ADD COLUMN IF NOT EXISTS id_card_url text,
  ADD COLUMN IF NOT EXISTS marital_status text,
  ADD COLUMN IF NOT EXISTS dependents integer DEFAULT 0;

-- Employee documents storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-documents', 'employee-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Company users read own employee docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'employee-documents'
  AND (storage.foldername(name))[1] = public.get_user_company_id(auth.uid())::text
);

CREATE POLICY "Company users upload own employee docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'employee-documents'
  AND (storage.foldername(name))[1] = public.get_user_company_id(auth.uid())::text
);

CREATE POLICY "Company users update own employee docs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'employee-documents'
  AND (storage.foldername(name))[1] = public.get_user_company_id(auth.uid())::text
);

CREATE POLICY "Company users delete own employee docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'employee-documents'
  AND (storage.foldername(name))[1] = public.get_user_company_id(auth.uid())::text
);
