
-- 1. Add invoice columns to students
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS invoice_number text,
  ADD COLUMN IF NOT EXISTS invoice_pdf_url text,
  ADD COLUMN IF NOT EXISTS invoice_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS invoice_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS invoice_status text,
  ADD COLUMN IF NOT EXISTS payment_method text;

-- 2. Short student ID sequence + generator
CREATE SEQUENCE IF NOT EXISTS public.student_short_id_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_short_student_id()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  n bigint;
  candidate text;
BEGIN
  LOOP
    n := nextval('public.student_short_id_seq');
    candidate := lpad(n::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.students WHERE student_id = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

-- Invoice number sequence
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE n bigint; y text;
BEGIN
  y := to_char(now(), 'YYYY');
  n := nextval('public.invoice_number_seq');
  RETURN 'INV-' || y || '-' || lpad(n::text, 4, '0');
END;
$$;

-- 3. RPC to confirm payment + assign short student_id + invoice_number
CREATE OR REPLACE FUNCTION public.confirm_payment_and_prepare_invoice(
  _student_uuid uuid,
  _payment_method text DEFAULT NULL,
  _paid_amount numeric DEFAULT NULL
)
RETURNS public.students
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.students;
  new_sid text;
  new_inv text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO s FROM public.students WHERE id = _student_uuid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Student not found'; END IF;

  -- Assign short 4-digit ID only if current ID is not already 4-digit numeric
  IF s.student_id !~ '^\d{4}$' THEN
    new_sid := public.generate_short_student_id();
  ELSE
    new_sid := s.student_id;
  END IF;

  IF s.invoice_number IS NULL THEN
    new_inv := public.generate_invoice_number();
  ELSE
    new_inv := s.invoice_number;
  END IF;

  UPDATE public.students SET
    student_id = new_sid,
    invoice_number = new_inv,
    payment_status = 'confirmed',
    status = 'registered',
    payment_confirmed_at = COALESCE(payment_confirmed_at, now()),
    payment_method = COALESCE(_payment_method, payment_method),
    paid_amount = COALESCE(_paid_amount, paid_amount),
    remaining_amount = GREATEST(COALESCE(course_fee,0) - COALESCE(_paid_amount, paid_amount, 0), 0)
  WHERE id = _student_uuid
  RETURNING * INTO s;

  RETURN s;
END;
$$;

-- 4. invoice_logs table
CREATE TABLE IF NOT EXISTS public.invoice_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  invoice_number text,
  channel text NOT NULL DEFAULT 'whatsapp',
  status text NOT NULL,
  phone text,
  provider_response jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_logs TO authenticated;
GRANT ALL ON public.invoice_logs TO service_role;

ALTER TABLE public.invoice_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage invoice logs"
ON public.invoice_logs FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
