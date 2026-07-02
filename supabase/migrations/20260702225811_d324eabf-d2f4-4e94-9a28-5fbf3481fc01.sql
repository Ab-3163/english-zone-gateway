
CREATE OR REPLACE FUNCTION public.list_published_results(_query text DEFAULT NULL)
RETURNS TABLE(
  student_id text,
  full_name text,
  course text,
  level text,
  score numeric,
  grade text,
  status text,
  admin_note text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE q text;
BEGIN
  q := NULLIF(trim(coalesce(_query, '')), '');
  RETURN QUERY
  SELECT sr.student_id, sr.full_name, sr.course, sr.level, sr.score, sr.grade, sr.status, sr.admin_note
  FROM public.student_results sr
  WHERE sr.published = true
    AND (
      q IS NULL
      OR sr.student_id ILIKE '%' || q || '%'
      OR coalesce(sr.phone,'') ILIKE '%' || q || '%'
      OR sr.full_name ILIKE '%' || q || '%'
    )
  ORDER BY sr.course ASC, sr.level ASC NULLS LAST, sr.student_id ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_published_results(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_published_results(text) TO anon, authenticated;
