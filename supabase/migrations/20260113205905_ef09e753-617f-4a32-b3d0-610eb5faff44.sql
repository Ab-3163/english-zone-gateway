-- Add published column to media table
ALTER TABLE public.media 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

-- Add title column to media table (optional)
ALTER TABLE public.media 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Update existing media to be published by default
UPDATE public.media SET published = true WHERE published IS NULL;

-- Update RLS policy for public to only see published media
DROP POLICY IF EXISTS "Public can read media" ON public.media;
CREATE POLICY "Public can read published media"
ON public.media
FOR SELECT
USING (published = true);

-- Ensure admins can still manage all media
DROP POLICY IF EXISTS "Admins can manage media" ON public.media;
CREATE POLICY "Admins can read all media"
ON public.media
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert media"
ON public.media
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update media"
ON public.media
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete media"
ON public.media
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));