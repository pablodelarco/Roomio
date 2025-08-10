-- Add utilities payment field to bills table
ALTER TABLE public.bills 
ADD COLUMN utilities_paid BOOLEAN DEFAULT false;