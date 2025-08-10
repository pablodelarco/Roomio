-- Add foreign key constraint between bills and apartments tables
ALTER TABLE public.bills 
ADD CONSTRAINT bills_apartment_id_fkey 
FOREIGN KEY (apartment_id) 
REFERENCES public.apartments(id) 
ON DELETE CASCADE;