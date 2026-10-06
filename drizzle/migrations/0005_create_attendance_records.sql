CREATE TABLE public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  work_date date NOT NULL,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late','half_day','on_leave')),
  check_in time,
  check_out time,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, work_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_records TO authenticated;
GRANT ALL ON public.attendance_records TO service_role;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View attendance" ON public.attendance_records FOR SELECT TO authenticated USING (public.can_access_company(auth.uid(), company_id));
CREATE POLICY "Insert attendance" ON public.attendance_records FOR INSERT TO authenticated WITH CHECK (public.can_manage_company(auth.uid(), company_id));
CREATE POLICY "Update attendance" ON public.attendance_records FOR UPDATE TO authenticated USING (public.can_manage_company(auth.uid(), company_id));
CREATE POLICY "Delete attendance" ON public.attendance_records FOR DELETE TO authenticated USING (public.can_manage_company(auth.uid(), company_id));
CREATE INDEX attendance_company_date_idx ON public.attendance_records(company_id, work_date);