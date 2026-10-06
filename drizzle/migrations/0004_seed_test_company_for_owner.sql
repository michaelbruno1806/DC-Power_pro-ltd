DO $$
DECLARE cid uuid; uid uuid := 'db889cab-a729-462d-b848-fb2c9a4d7ffe';
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = uid AND company_id IS NULL) THEN
    INSERT INTO public.companies(name,brn,ern,tan,address,city,email,phone,setup_completed,subscription_status,trial_ends_at,payroll_frequency,currency)
    VALUES ('DC Payroll Test Co (demo)','C00000000','E00000000','T00000000','1 Test Street','Port Louis','djmichael.bruno33@gmail.com','+230 5000 0000',true,'trial',now()+interval '14 days','monthly','MUR')
    RETURNING id INTO cid;
    UPDATE public.profiles SET company_id = cid WHERE user_id = uid;
    INSERT INTO public.user_roles(user_id, role) VALUES (uid,'company_owner') ON CONFLICT DO NOTHING;
    INSERT INTO public.employees(company_id,first_name,last_name,employee_code,basic_salary,transport_allowance,status,employment_date,job_title)
    VALUES (cid,'Test','Employee One','EMP001',45000,2000,'active','2025-01-01','Accountant'),
           (cid,'Test','Employee Two','EMP002',25000,1500,'active','2025-03-01','Clerk');
  END IF;
END $$;