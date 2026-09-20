-- Align with the uploaded multi-tenant schema: bank code per employee
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS bank_code text;

-- Track when a payroll period was filed with the MRA
ALTER TABLE public.payroll_files
  ADD COLUMN IF NOT EXISTS mra_filed_at timestamptz;
