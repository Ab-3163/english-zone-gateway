GRANT INSERT ON public.students TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;

GRANT SELECT, UPDATE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;

GRANT USAGE, SELECT ON SEQUENCE public.student_id_seq TO anon, authenticated, service_role;