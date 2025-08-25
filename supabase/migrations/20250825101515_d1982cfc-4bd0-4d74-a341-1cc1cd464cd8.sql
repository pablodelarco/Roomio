-- Add user_id columns to associate data with users
ALTER TABLE public.apartments ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.bills ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.rent_payments ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.rooms ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tenants ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id NOT NULL for new records (existing records will need to be updated)
-- We'll set a default for now to avoid breaking existing data

-- Drop all existing overly permissive policies
DROP POLICY IF EXISTS "All authenticated users can view apartments" ON public.apartments;
DROP POLICY IF EXISTS "All authenticated users can insert apartments" ON public.apartments;
DROP POLICY IF EXISTS "All authenticated users can update apartments" ON public.apartments;
DROP POLICY IF EXISTS "All authenticated users can delete apartments" ON public.apartments;

DROP POLICY IF EXISTS "All authenticated users can view bills" ON public.bills;
DROP POLICY IF EXISTS "All authenticated users can insert bills" ON public.bills;
DROP POLICY IF EXISTS "All authenticated users can update bills" ON public.bills;
DROP POLICY IF EXISTS "All authenticated users can delete bills" ON public.bills;

DROP POLICY IF EXISTS "All authenticated users can view rent payments" ON public.rent_payments;
DROP POLICY IF EXISTS "All authenticated users can insert rent payments" ON public.rent_payments;
DROP POLICY IF EXISTS "All authenticated users can update rent payments" ON public.rent_payments;
DROP POLICY IF EXISTS "All authenticated users can delete rent payments" ON public.rent_payments;

DROP POLICY IF EXISTS "All authenticated users can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "All authenticated users can insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "All authenticated users can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "All authenticated users can delete rooms" ON public.rooms;

DROP POLICY IF EXISTS "All authenticated users can view tenants" ON public.tenants;
DROP POLICY IF EXISTS "All authenticated users can insert tenants" ON public.tenants;
DROP POLICY IF EXISTS "All authenticated users can update tenants" ON public.tenants;
DROP POLICY IF EXISTS "All authenticated users can delete tenants" ON public.tenants;

-- Create secure RLS policies based on user ownership and roles

-- Apartments policies
CREATE POLICY "Users can view their own apartments or admins can view all"
ON public.apartments FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own apartments"
ON public.apartments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own apartments or admins can update all"
ON public.apartments FOR UPDATE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own apartments or admins can delete all"
ON public.apartments FOR DELETE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Bills policies
CREATE POLICY "Users can view their own bills or admins can view all"
ON public.bills FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own bills"
ON public.bills FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bills or admins can update all"
ON public.bills FOR UPDATE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own bills or admins can delete all"
ON public.bills FOR DELETE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Rent payments policies
CREATE POLICY "Users can view their own rent payments or admins can view all"
ON public.rent_payments FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own rent payments"
ON public.rent_payments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own rent payments or admins can update all"
ON public.rent_payments FOR UPDATE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own rent payments or admins can delete all"
ON public.rent_payments FOR DELETE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Rooms policies
CREATE POLICY "Users can view their own rooms or admins can view all"
ON public.rooms FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own rooms"
ON public.rooms FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own rooms or admins can update all"
ON public.rooms FOR UPDATE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own rooms or admins can delete all"
ON public.rooms FOR DELETE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Tenants policies
CREATE POLICY "Users can view their own tenants or admins can view all"
ON public.tenants FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own tenants"
ON public.tenants FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tenants or admins can update all"
ON public.tenants FOR UPDATE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own tenants or admins can delete all"
ON public.tenants FOR DELETE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));