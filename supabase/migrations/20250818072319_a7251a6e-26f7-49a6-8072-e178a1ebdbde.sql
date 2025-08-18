-- Update RLS policies to allow all authenticated users to manage data

-- Update apartments policies
DROP POLICY IF EXISTS "Property managers can view apartments" ON public.apartments;
DROP POLICY IF EXISTS "Property managers can insert apartments" ON public.apartments;
DROP POLICY IF EXISTS "Property managers can update apartments" ON public.apartments;
DROP POLICY IF EXISTS "Property managers can delete apartments" ON public.apartments;

CREATE POLICY "All authenticated users can view apartments" 
ON public.apartments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can insert apartments" 
ON public.apartments FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "All authenticated users can update apartments" 
ON public.apartments FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can delete apartments" 
ON public.apartments FOR DELETE 
TO authenticated 
USING (true);

-- Update rooms policies
DROP POLICY IF EXISTS "Property managers can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Property managers can insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Property managers can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Property managers can delete rooms" ON public.rooms;

CREATE POLICY "All authenticated users can view rooms" 
ON public.rooms FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can insert rooms" 
ON public.rooms FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "All authenticated users can update rooms" 
ON public.rooms FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can delete rooms" 
ON public.rooms FOR DELETE 
TO authenticated 
USING (true);

-- Update tenants policies
DROP POLICY IF EXISTS "Property managers can view tenants" ON public.tenants;
DROP POLICY IF EXISTS "Property managers can insert tenants" ON public.tenants;
DROP POLICY IF EXISTS "Property managers can update tenants" ON public.tenants;
DROP POLICY IF EXISTS "Property managers can delete tenants" ON public.tenants;

CREATE POLICY "All authenticated users can view tenants" 
ON public.tenants FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can insert tenants" 
ON public.tenants FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "All authenticated users can update tenants" 
ON public.tenants FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can delete tenants" 
ON public.tenants FOR DELETE 
TO authenticated 
USING (true);

-- Update rent_payments policies
DROP POLICY IF EXISTS "Property managers can view rent payments" ON public.rent_payments;
DROP POLICY IF EXISTS "Property managers can insert rent payments" ON public.rent_payments;
DROP POLICY IF EXISTS "Property managers can update rent payments" ON public.rent_payments;
DROP POLICY IF EXISTS "Property managers can delete rent payments" ON public.rent_payments;

CREATE POLICY "All authenticated users can view rent payments" 
ON public.rent_payments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can insert rent payments" 
ON public.rent_payments FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "All authenticated users can update rent payments" 
ON public.rent_payments FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can delete rent payments" 
ON public.rent_payments FOR DELETE 
TO authenticated 
USING (true);

-- Update bills policies
DROP POLICY IF EXISTS "Property managers can view bills" ON public.bills;
DROP POLICY IF EXISTS "Property managers can insert bills" ON public.bills;
DROP POLICY IF EXISTS "Property managers can update bills" ON public.bills;
DROP POLICY IF EXISTS "Property managers can delete bills" ON public.bills;

CREATE POLICY "All authenticated users can view bills" 
ON public.bills FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can insert bills" 
ON public.bills FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "All authenticated users can update bills" 
ON public.bills FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can delete bills" 
ON public.bills FOR DELETE 
TO authenticated 
USING (true);