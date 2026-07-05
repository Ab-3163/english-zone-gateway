ALTER TABLE public.registrations 
  ADD COLUMN IF NOT EXISTS receipt_url text,
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'bankily';