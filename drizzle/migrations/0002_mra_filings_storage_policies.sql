CREATE POLICY "Company reads mra filings" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'mra-filings' AND public.can_access_company(auth.uid(), ((storage.foldername(name))[1])::uuid));

CREATE POLICY "Company uploads mra filings" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'mra-filings' AND public.can_manage_company(auth.uid(), ((storage.foldername(name))[1])::uuid));

CREATE POLICY "Company updates mra filings" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'mra-filings' AND public.can_manage_company(auth.uid(), ((storage.foldername(name))[1])::uuid));

CREATE POLICY "Company deletes mra filings" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'mra-filings' AND public.can_manage_company(auth.uid(), ((storage.foldername(name))[1])::uuid));