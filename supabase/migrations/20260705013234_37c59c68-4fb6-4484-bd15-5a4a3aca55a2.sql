
-- 1) Change students.student_id default to 4-digit generator
ALTER TABLE public.students ALTER COLUMN student_id SET DEFAULT public.generate_short_student_id();

-- 2) Migrate any legacy non-4-digit student IDs to the new short format,
--    cascading the change into related tables.
DO $$
DECLARE
  r RECORD;
  new_id text;
BEGIN
  FOR r IN SELECT id, student_id FROM public.students WHERE student_id !~ '^\d{4}$' LOOP
    new_id := public.generate_short_student_id();
    UPDATE public.students        SET student_id = new_id WHERE id = r.id;
    UPDATE public.certificates    SET student_id = new_id WHERE student_id = r.student_id;
    UPDATE public.student_results SET student_id = new_id WHERE student_id = r.student_id;
  END LOOP;
END $$;
