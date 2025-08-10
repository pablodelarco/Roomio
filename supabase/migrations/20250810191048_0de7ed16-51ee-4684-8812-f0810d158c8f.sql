-- Add deposit_returned field to tenants table
ALTER TABLE public.tenants 
ADD COLUMN deposit_returned boolean DEFAULT false;