-- Add attempts column to admin_otp_codes table for rate limiting
ALTER TABLE public.admin_otp_codes ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;