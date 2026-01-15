-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Admins can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view uploads" ON storage.objects;

-- Create storage policies for admins
CREATE POLICY "Admins can upload files" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete files" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Anyone can view uploads" ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'uploads');