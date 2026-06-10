
CREATE POLICY "Anyone can upload payment receipts"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "Admins can read payment receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payment-receipts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete payment receipts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'payment-receipts' AND public.has_role(auth.uid(), 'admin'));
