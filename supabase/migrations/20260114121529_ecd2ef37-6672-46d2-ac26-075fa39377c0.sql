-- Fix has_role function to prevent unauthorized role enumeration
-- Now only allows checking own role or if caller is already admin

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow checking own role or if caller is already admin
  IF auth.uid() IS NULL THEN
    -- No authenticated user - used in RLS policies with service role context
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    );
  END IF;
  
  IF auth.uid() != _user_id THEN
    -- Caller checking someone else's role - only allow if caller is admin
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- Fix storage policies: Make uploads bucket private and enforce published status

-- Make the uploads bucket private
UPDATE storage.buckets SET public = false WHERE id = 'uploads';

-- Drop the permissive "Anyone can view uploads" policy if it exists
DROP POLICY IF EXISTS "Anyone can view uploads" ON storage.objects;

-- Create policy that checks media table published status for public access
CREATE POLICY "View published uploads only" ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'uploads' AND
  (
    -- Allow admins to see everything
    public.has_role(auth.uid(), 'admin') OR
    -- Or check if file is published in media table
    EXISTS (
      SELECT 1 FROM public.media
      WHERE media.file_url LIKE '%' || storage.objects.name
      AND media.published = true
    )
  )
);

-- Keep existing admin policies for upload/delete
-- These should already exist but let's ensure they're correct
DROP POLICY IF EXISTS "Admins can upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update media files" ON storage.objects;

CREATE POLICY "Admins can upload media files" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update media files" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete media files" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  public.has_role(auth.uid(), 'admin')
);