
-- Sequence for student IDs (year-based)
CREATE SEQUENCE IF NOT EXISTS public.student_id_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_student_id()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_num bigint;
  year_part text;
BEGIN
  year_part := to_char(now(), 'YYYY');
  next_num := nextval('public.student_id_seq');
  RETURN 'EZ-' || year_part || '-' || lpad(next_num::text, 4, '0');
END;
$$;

-- Students table
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL UNIQUE DEFAULT public.generate_student_id(),
  -- Personal
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  birth_date date,
  age integer,
  -- Academic
  language text,
  level text,
  group_name text,
  teacher text,
  study_days text,
  study_time text,
  room text,
  course_type text,
  preferred_time text,
  -- Financial
  course_fee numeric DEFAULT 1700,
  paid_amount numeric DEFAULT 0,
  remaining_amount numeric DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_receipt_url text,
  payment_confirmed_at timestamptz,
  -- Results
  first_exam_score numeric,
  final_exam_score numeric,
  average numeric,
  grade text,
  pass_status text,
  admin_note text,
  next_level text,
  eligible_promotion boolean DEFAULT false,
  -- Attendance
  total_sessions integer DEFAULT 0,
  absences integer DEFAULT 0,
  attendance_rate numeric DEFAULT 0,
  -- Status
  status text NOT NULL DEFAULT 'awaiting_confirmation',
  rejection_reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT INSERT ON public.students TO anon;
GRANT ALL ON public.students TO service_role;
GRANT USAGE ON SEQUENCE public.student_id_seq TO anon, authenticated, service_role;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Public can register (insert only)
CREATE POLICY "Anyone can register as student"
  ON public.students FOR INSERT
  WITH CHECK (true);

-- Admins full access
CREATE POLICY "Admins can view all students"
  ON public.students FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update students"
  ON public.students FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete students"
  ON public.students FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update trigger
CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Secure login function: returns student row only on exact credential match
CREATE OR REPLACE FUNCTION public.get_student_by_credentials(_student_id text, _phone text)
RETURNS SETOF public.students
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _student_id IS NULL OR _phone IS NULL OR length(trim(_student_id)) < 5 OR length(trim(_phone)) < 5 THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT * FROM public.students
  WHERE student_id = trim(_student_id)
    AND phone = trim(_phone)
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_by_credentials(text, text) TO anon, authenticated;

-- Admin notifications log
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  body text,
  metadata jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage notifications"
  ON public.admin_notifications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert notifications"
  ON public.admin_notifications FOR INSERT
  TO anon
  WITH CHECK (true);
