-- Add utilities payment field to rent_payments table
ALTER TABLE public.rent_payments 
ADD COLUMN utilities_paid BOOLEAN DEFAULT false;