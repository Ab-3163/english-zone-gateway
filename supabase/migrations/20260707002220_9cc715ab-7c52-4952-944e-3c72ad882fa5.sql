ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.registrations FROM anon;
REVOKE ALL ON TABLE public.registrations FROM authenticated;

GRANT INSERT ON TABLE public.registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.registrations TO authenticated;
GRANT ALL ON TABLE public.registrations TO service_role;

DROP POLICY IF EXISTS "Anyone can submit registration" ON public.registrations;
DROP POLICY IF EXISTS "Admins read registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins update registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins delete registrations" ON public.registrations;

CREATE POLICY "Anyone can submit registration"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins read registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins update registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins delete registrations"
ON public.registrations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));