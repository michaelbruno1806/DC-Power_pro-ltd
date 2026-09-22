CREATE TABLE public.mra_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  payroll_file_id uuid NOT NULL REFERENCES public.payroll_files(id) ON DELETE CASCADE,
  month integer NOT NULL,
  year integer NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  reference_number text,
  amount_paid numeric,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  notes text,
  return_path text,
  acknowledgement_path text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX mra_submissions_file_idx ON public.mra_submissions(payroll_file_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mra_submissions TO authenticated;
GRANT ALL ON public.mra_submissions TO service_role;

ALTER TABLE public.mra_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View mra submissions" ON public.mra_submissions
FOR SELECT TO authenticated
USING (public.can_access_company(auth.uid(), company_id));

CREATE POLICY "Manage mra submissions" ON public.mra_submissions
FOR ALL TO authenticated
USING (public.can_manage_company(auth.uid(), company_id))
WITH CHECK (public.can_manage_company(auth.uid(), company_id));