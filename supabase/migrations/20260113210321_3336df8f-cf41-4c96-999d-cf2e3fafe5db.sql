-- Fix RLS policies to be PERMISSIVE (OR logic) instead of RESTRICTIVE (AND logic)
-- This allows multiple policies to work together - admin OR public can access

-- Drop and recreate announcements policies
DROP POLICY IF EXISTS "Public can read published announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;

CREATE POLICY "Public can read published announcements"
ON public.announcements
FOR SELECT
TO public
USING (published = true);

CREATE POLICY "Admins can manage announcements"
ON public.announcements
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'admin'));

-- Drop and recreate courses policies
DROP POLICY IF EXISTS "Public can read published courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;

CREATE POLICY "Public can read published courses"
ON public.courses
FOR SELECT
TO public
USING (published = true);

CREATE POLICY "Admins can manage courses"
ON public.courses
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'admin'));

-- Drop and recreate media policies
DROP POLICY IF EXISTS "Public can read published media" ON public.media;
DROP POLICY IF EXISTS "Admins can read all media" ON public.media;
DROP POLICY IF EXISTS "Admins can insert media" ON public.media;
DROP POLICY IF EXISTS "Admins can update media" ON public.media;
DROP POLICY IF EXISTS "Admins can delete media" ON public.media;

CREATE POLICY "Public can read published media"
ON public.media
FOR SELECT
TO public
USING (published = true);

CREATE POLICY "Admins can manage media"
ON public.media
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'admin'));

-- Drop and recreate settings policies
DROP POLICY IF EXISTS "Public can read settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;

CREATE POLICY "Public can read settings"
ON public.settings
FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.settings
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'admin'));