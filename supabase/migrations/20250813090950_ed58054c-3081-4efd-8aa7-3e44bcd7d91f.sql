-- Secure RLS policies: restrict all tables to authenticated users only
-- NOTE: This does not yet isolate data per user; it simply blocks anonymous access.
-- After this migration, the app will require authentication for all reads/writes.

-- Apartments
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on apartments" ON public.apartments;
DROP POLICY IF EXISTS "Allow select to authenticated" ON public.apartments;
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.apartments;
DROP POLICY IF EXISTS "Allow update to authenticated" ON public.apartments;
DROP POLICY IF EXISTS "Allow delete to authenticated" ON public.apartments;
CREATE POLICY "Allow select to authenticated" ON public.apartments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow insert to authenticated" ON public.apartments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow update to authenticated" ON public.apartments FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow delete to authenticated" ON public.apartments FOR DELETE USING (auth.uid() IS NOT NULL);

-- Rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow select to authenticated" ON public.rooms;
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.rooms;
DROP POLICY IF EXISTS "Allow update to authenticated" ON public.rooms;
DROP POLICY IF EXISTS "Allow delete to authenticated" ON public.rooms;
CREATE POLICY "Allow select to authenticated" ON public.rooms FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow insert to authenticated" ON public.rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow update to authenticated" ON public.rooms FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow delete to authenticated" ON public.rooms FOR DELETE USING (auth.uid() IS NOT NULL);

-- Tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow select to authenticated" ON public.tenants;
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.tenants;
DROP POLICY IF EXISTS "Allow update to authenticated" ON public.tenants;
DROP POLICY IF EXISTS "Allow delete to authenticated" ON public.tenants;
CREATE POLICY "Allow select to authenticated" ON public.tenants FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow insert to authenticated" ON public.tenants FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow update to authenticated" ON public.tenants FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow delete to authenticated" ON public.tenants FOR DELETE USING (auth.uid() IS NOT NULL);

-- Rent payments
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on rent_payments" ON public.rent_payments;
DROP POLICY IF EXISTS "Allow select to authenticated" ON public.rent_payments;
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.rent_payments;
DROP POLICY IF EXISTS "Allow update to authenticated" ON public.rent_payments;
DROP POLICY IF EXISTS "Allow delete to authenticated" ON public.rent_payments;
CREATE POLICY "Allow select to authenticated" ON public.rent_payments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow insert to authenticated" ON public.rent_payments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow update to authenticated" ON public.rent_payments FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow delete to authenticated" ON public.rent_payments FOR DELETE USING (auth.uid() IS NOT NULL);

-- Bills
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on bills" ON public.bills;
DROP POLICY IF EXISTS "Allow select to authenticated" ON public.bills;
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.bills;
DROP POLICY IF EXISTS "Allow update to authenticated" ON public.bills;
DROP POLICY IF EXISTS "Allow delete to authenticated" ON public.bills;
CREATE POLICY "Allow select to authenticated" ON public.bills FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow insert to authenticated" ON public.bills FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow update to authenticated" ON public.bills FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow delete to authenticated" ON public.bills FOR DELETE USING (auth.uid() IS NOT NULL);
