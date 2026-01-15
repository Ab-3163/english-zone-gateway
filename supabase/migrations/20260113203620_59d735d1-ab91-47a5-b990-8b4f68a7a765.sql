-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles (only admins can read)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create OTP codes table for admin verification
CREATE TABLE public.admin_otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on otp_codes
ALTER TABLE public.admin_otp_codes ENABLE ROW LEVEL SECURITY;

-- No direct access to OTP codes from frontend
CREATE POLICY "No direct access to OTP codes"
ON public.admin_otp_codes
FOR ALL
USING (false);

-- Create admin sessions table for 30-day sessions
CREATE TABLE public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    device_id TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, device_id)
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own sessions
CREATE POLICY "Users can view own sessions"
ON public.admin_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Create announcements table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Public can read published announcements
CREATE POLICY "Public can read published announcements"
ON public.announcements
FOR SELECT
USING (published = true);

-- Admins can do everything with announcements
CREATE POLICY "Admins can manage announcements"
ON public.announcements
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    features TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Public can read published courses
CREATE POLICY "Public can read published courses"
ON public.courses
FOR SELECT
USING (published = true);

-- Admins can do everything with courses
CREATE POLICY "Admins can manage courses"
ON public.courses
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create settings table for global settings
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
CREATE POLICY "Public can read settings"
ON public.settings
FOR SELECT
USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can manage settings"
ON public.settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create media table for images and videos
CREATE TABLE public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on media
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Public can read media
CREATE POLICY "Public can read media"
ON public.media
FOR SELECT
USING (true);

-- Admins can manage media
CREATE POLICY "Admins can manage media"
ON public.media
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Storage policies for uploads bucket
CREATE POLICY "Public can view uploads"
ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads');

CREATE POLICY "Admins can upload files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'uploads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'uploads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'uploads' AND public.has_role(auth.uid(), 'admin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();