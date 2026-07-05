ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS study_center text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS study_center text;