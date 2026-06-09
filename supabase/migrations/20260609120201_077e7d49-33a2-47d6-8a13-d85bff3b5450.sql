
-- =========================
-- STUDENT RESULTS
-- =========================
CREATE TABLE public.student_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  course TEXT NOT NULL,
  level TEXT,
  score NUMERIC,
  grade TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pass / fail / pending
  admin_note TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_results_student_id ON public.student_results(student_id);
CREATE INDEX idx_student_results_phone ON public.student_results(phone);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_results TO authenticated;
GRANT ALL ON public.student_results TO service_role;

ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;

-- Only admins direct access; public must use the search function
CREATE POLICY "Admins manage student results"
ON public.student_results
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Secure search function: returns only published rows matching exact student_id or phone
CREATE OR REPLACE FUNCTION public.search_student_result(_query TEXT)
RETURNS TABLE (
  full_name TEXT,
  course TEXT,
  level TEXT,
  score NUMERIC,
  grade TEXT,
  status TEXT,
  admin_note TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _query IS NULL OR length(trim(_query)) < 3 THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT sr.full_name, sr.course, sr.level, sr.score, sr.grade, sr.status, sr.admin_note
  FROM public.student_results sr
  WHERE sr.published = true
    AND (sr.student_id = trim(_query) OR sr.phone = trim(_query));
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_student_result(TEXT) TO anon, authenticated;

CREATE TRIGGER update_student_results_updated_at
BEFORE UPDATE ON public.student_results
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- REGISTRATIONS
-- =========================
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER,
  language TEXT NOT NULL,
  level TEXT,
  course_type TEXT,
  preferred_time TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- new / contacted / confirmed / rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (insert) a registration
CREATE POLICY "Anyone can submit registration"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(full_name)) BETWEEN 2 AND 100
  AND length(trim(phone)) BETWEEN 5 AND 30
  AND length(coalesce(notes, '')) <= 1000
);

-- Only admins can read / update / delete
CREATE POLICY "Admins read registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete registrations"
ON public.registrations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- SITE SETTINGS (seed new keys into existing settings table)
-- =========================
INSERT INTO public.settings (key, value) VALUES
  ('google_maps_embed_url', ''),
  ('google_maps_direct_link', ''),
  ('center_address', ''),
  ('center_phone', ''),
  ('center_whatsapp', '+22220454530')
ON CONFLICT (key) DO NOTHING;
