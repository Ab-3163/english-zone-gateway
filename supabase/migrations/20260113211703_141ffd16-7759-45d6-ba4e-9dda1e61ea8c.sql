-- Add language column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english';

-- Update existing course to have a language
UPDATE public.courses SET language = 'arabic' WHERE title LIKE '%عربية%';