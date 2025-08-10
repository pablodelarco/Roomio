-- Clean up duplicate rent payments and add unique constraint
-- First, let's identify and remove duplicates, keeping only the most recent record per tenant per month

-- Delete duplicate records, keeping only the one with the latest created_at
DELETE FROM public.rent_payments 
WHERE id NOT IN (
  SELECT DISTINCT ON (tenant_id, due_date) id
  FROM public.rent_payments 
  ORDER BY tenant_id, due_date, created_at DESC
);

-- Add a unique constraint to prevent future duplicates
ALTER TABLE public.rent_payments 
ADD CONSTRAINT unique_tenant_due_date 
UNIQUE (tenant_id, due_date);