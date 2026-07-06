
-- Ensure grants exist for API roles
GRANT INSERT ON public.registrations TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;

-- Recreate the INSERT policy with a simple, correct check
DROP POLICY IF EXISTS "Anyone can submit registration" ON public.registrations;
CREATE POLICY "Anyone can submit registration"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(full_name)) BETWEEN 2 AND 100
  AND length(trim(phone)) BETWEEN 5 AND 30
  AND length(coalesce(notes, '')) <= 1000
);
