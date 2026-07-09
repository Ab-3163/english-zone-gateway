
-- Update result pass logic to use /20 scale (pass >= 10)
CREATE OR REPLACE FUNCTION public.handle_result_pass()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.score IS NOT NULL THEN
    IF NEW.score >= 10 THEN
      NEW.status := 'pass';
    ELSE
      NEW.status := 'fail';
    END IF;

    -- Auto grade on /20 scale
    IF NEW.score >= 18 THEN NEW.grade := 'ممتاز';
    ELSIF NEW.score >= 16 THEN NEW.grade := 'جيد جداً';
    ELSIF NEW.score >= 14 THEN NEW.grade := 'جيد';
    ELSIF NEW.score >= 10 THEN NEW.grade := 'مقبول';
    ELSE NEW.grade := 'راسب';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_certificate_on_pass()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'pass' AND NEW.score IS NOT NULL AND NEW.score >= 10 THEN
    UPDATE public.students SET pass_status = 'pass', average = NEW.score, grade = COALESCE(NEW.grade, grade)
      WHERE student_id = NEW.student_id;
    IF NOT EXISTS (SELECT 1 FROM public.certificates WHERE result_id = NEW.id) THEN
      INSERT INTO public.certificates (student_id, full_name, course, level, score, grade, result_id)
      VALUES (NEW.student_id, NEW.full_name, NEW.course, NEW.level, NEW.score, NEW.grade, NEW.id);
    END IF;
  ELSIF NEW.status = 'fail' THEN
    UPDATE public.students SET pass_status = 'fail' WHERE student_id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$function$;
