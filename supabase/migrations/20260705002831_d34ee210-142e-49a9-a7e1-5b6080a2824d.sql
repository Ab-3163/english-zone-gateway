
CREATE POLICY "Admins read invoices"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins upload invoices"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update invoices"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete invoices"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'::app_role));
