
-- Certificates table
CREATE SEQUENCE IF NOT EXISTS public.certificate_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS text LANGUAGE plpgsql SET search_path = public AS $$
DECLARE n bigint; y text;
BEGIN
  y := to_char(now(), 'YYYY');
  n := nextval('public.certificate_seq');
  RETURN 'CERT-' || y || '-' || lpad(n::text, 4, '0');
END;
$$;

CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number text UNIQUE NOT NULL DEFAULT public.generate_certificate_number(),
  student_id text NOT NULL,
  full_name text NOT NULL,
  course text NOT NULL,
  level text,
  score numeric,
  grade text,
  pass_date date NOT NULL DEFAULT CURRENT_DATE,
  result_id uuid REFERENCES public.student_results(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS certificates_student_idx ON public.certificates(student_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT SELECT ON public.certificates TO anon;
GRANT ALL ON public.certificates TO service_role;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage certificates" ON public.certificates
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view certificates" ON public.certificates
  FOR SELECT TO anon, authenticated USING (true);

CREATE TRIGGER set_certificates_updated_at BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger on student_results: auto pass/fail + auto certificate
CREATE OR REPLACE FUNCTION public.handle_result_pass()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.score IS NOT NULL THEN
    IF NEW.score >= 50 THEN
      NEW.status := 'pass';
    ELSE
      NEW.status := 'fail';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_result_status ON public.student_results;
CREATE TRIGGER set_result_status BEFORE INSERT OR UPDATE OF score ON public.student_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_result_pass();

CREATE OR REPLACE FUNCTION public.create_certificate_on_pass()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'pass' AND NEW.score IS NOT NULL AND NEW.score >= 50 THEN
    -- Update student pass_status if matches
    UPDATE public.students SET pass_status = 'pass', average = NEW.score, grade = COALESCE(NEW.grade, grade)
      WHERE student_id = NEW.student_id;
    -- Create certificate if not exists for this result
    IF NOT EXISTS (SELECT 1 FROM public.certificates WHERE result_id = NEW.id) THEN
      INSERT INTO public.certificates (student_id, full_name, course, level, score, grade, result_id)
      VALUES (NEW.student_id, NEW.full_name, NEW.course, NEW.level, NEW.score, NEW.grade, NEW.id);
    END IF;
  ELSIF NEW.status = 'fail' THEN
    UPDATE public.students SET pass_status = 'fail' WHERE student_id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_cert_on_pass ON public.student_results;
CREATE TRIGGER create_cert_on_pass AFTER INSERT OR UPDATE ON public.student_results
  FOR EACH ROW EXECUTE FUNCTION public.create_certificate_on_pass();
