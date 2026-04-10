
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'client_admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  company_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ern TEXT,
  brn TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Mauritius',
  phone TEXT,
  email TEXT,
  director_name TEXT,
  director_nic TEXT,
  pay_period_start_day INTEGER DEFAULT 1,
  pay_period_end_day INTEGER DEFAULT 31,
  mra_due_day INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from profiles to companies
ALTER TABLE public.profiles ADD CONSTRAINT profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

-- Create employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nic TEXT,
  date_of_birth DATE,
  gender TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  bank_name TEXT,
  bank_account TEXT,
  basic_salary NUMERIC(12,2) DEFAULT 0,
  employment_date DATE,
  termination_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payroll_components table
CREATE TABLE public.payroll_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('addition', 'deduction')),
  amount NUMERIC(12,2) DEFAULT 0,
  is_percentage BOOLEAN DEFAULT false,
  taxable BOOLEAN DEFAULT true,
  in_wage_bill BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payroll_files table
CREATE TABLE public.payroll_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'approved')),
  total_gross NUMERIC(14,2) DEFAULT 0,
  total_deductions NUMERIC(14,2) DEFAULT 0,
  total_net NUMERIC(14,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, month, year)
);

-- Create payroll_entries table
CREATE TABLE public.payroll_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_file_id UUID REFERENCES public.payroll_files(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  basic_salary NUMERIC(12,2) DEFAULT 0,
  gross_pay NUMERIC(12,2) DEFAULT 0,
  total_deductions NUMERIC(12,2) DEFAULT 0,
  net_pay NUMERIC(12,2) DEFAULT 0,
  additions JSONB DEFAULT '{}',
  deductions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Companies policies
CREATE POLICY "Super admins can manage all companies" ON public.companies FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Client admins can view own company" ON public.companies FOR SELECT USING (id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Client admins can update own company" ON public.companies FOR UPDATE USING (id = public.get_user_company_id(auth.uid()));

-- Employees policies
CREATE POLICY "Super admins can manage all employees" ON public.employees FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Client admins can manage own employees" ON public.employees FOR ALL USING (company_id = public.get_user_company_id(auth.uid()));

-- Payroll components policies
CREATE POLICY "Super admins can manage all components" ON public.payroll_components FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Client admins can manage own components" ON public.payroll_components FOR ALL USING (company_id = public.get_user_company_id(auth.uid()));

-- Payroll files policies
CREATE POLICY "Super admins can manage all payroll files" ON public.payroll_files FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Client admins can manage own payroll files" ON public.payroll_files FOR ALL USING (company_id = public.get_user_company_id(auth.uid()));

-- Payroll entries policies
CREATE POLICY "Super admins can manage all entries" ON public.payroll_entries FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Client admins can manage own entries" ON public.payroll_entries FOR SELECT USING (
  payroll_file_id IN (SELECT id FROM public.payroll_files WHERE company_id = public.get_user_company_id(auth.uid()))
);
CREATE POLICY "Client admins can insert own entries" ON public.payroll_entries FOR INSERT WITH CHECK (
  payroll_file_id IN (SELECT id FROM public.payroll_files WHERE company_id = public.get_user_company_id(auth.uid()))
);
CREATE POLICY "Client admins can update own entries" ON public.payroll_entries FOR UPDATE USING (
  payroll_file_id IN (SELECT id FROM public.payroll_files WHERE company_id = public.get_user_company_id(auth.uid()))
);
CREATE POLICY "Client admins can delete own entries" ON public.payroll_entries FOR DELETE USING (
  payroll_file_id IN (SELECT id FROM public.payroll_files WHERE company_id = public.get_user_company_id(auth.uid()))
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_components_updated_at BEFORE UPDATE ON public.payroll_components FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_files_updated_at BEFORE UPDATE ON public.payroll_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_entries_updated_at BEFORE UPDATE ON public.payroll_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX idx_employees_company_id ON public.employees(company_id);
CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_payroll_files_company_id ON public.payroll_files(company_id);
CREATE INDEX idx_payroll_entries_payroll_file_id ON public.payroll_entries(payroll_file_id);
CREATE INDEX idx_payroll_entries_employee_id ON public.payroll_entries(employee_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
