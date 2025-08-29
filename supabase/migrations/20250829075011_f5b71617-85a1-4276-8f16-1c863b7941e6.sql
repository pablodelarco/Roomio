-- Get the first user ID from auth.users table to assign existing data
-- This will be assigned to the current authenticated user's data
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Get the first user ID from auth.users
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    -- If we have a user, assign all existing NULL user_id records to them
    IF first_user_id IS NOT NULL THEN
        UPDATE public.apartments SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.bills SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.rent_payments SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.rooms SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.tenants SET user_id = first_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- Now make user_id NOT NULL to enforce data ownership
ALTER TABLE public.apartments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.bills ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.rent_payments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.rooms ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.tenants ALTER COLUMN user_id SET NOT NULL;

-- Drop all existing policies that allowed admin access
DROP POLICY IF EXISTS "Users can view their own apartments or admins can view all" ON public.apartments;
DROP POLICY IF EXISTS "Users can insert their own apartments" ON public.apartments;
DROP POLICY IF EXISTS "Users can update their own apartments or admins can update all" ON public.apartments;
DROP POLICY IF EXISTS "Users can delete their own apartments or admins can delete all" ON public.apartments;

DROP POLICY IF EXISTS "Users can view their own bills or admins can view all" ON public.bills;
DROP POLICY IF EXISTS "Users can insert their own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can update their own bills or admins can update all" ON public.bills;
DROP POLICY IF EXISTS "Users can delete their own bills or admins can delete all" ON public.bills;

DROP POLICY IF EXISTS "Users can view their own rent payments or admins can view all" ON public.rent_payments;
DROP POLICY IF EXISTS "Users can insert their own rent payments" ON public.rent_payments;
DROP POLICY IF EXISTS "Users can update their own rent payments or admins can update all" ON public.rent_payments;
DROP POLICY IF EXISTS "Users can delete their own rent payments or admins can delete all" ON public.rent_payments;

DROP POLICY IF EXISTS "Users can view their own rooms or admins can view all" ON public.rooms;
DROP POLICY IF EXISTS "Users can insert their own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can update their own rooms or admins can update all" ON public.rooms;
DROP POLICY IF EXISTS "Users can delete their own rooms or admins can delete all" ON public.rooms;

DROP POLICY IF EXISTS "Users can view their own tenants or admins can view all" ON public.tenants;
DROP POLICY IF EXISTS "Users can insert their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can update their own tenants or admins can update all" ON public.tenants;
DROP POLICY IF EXISTS "Users can delete their own tenants or admins can delete all" ON public.tenants;

-- Create STRICT user-only policies (no admin override, complete data isolation)

-- Apartments policies
CREATE POLICY "Users can only view their own apartments"
ON public.apartments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own apartments"
ON public.apartments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only update their own apartments"
ON public.apartments FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can only delete their own apartments"
ON public.apartments FOR DELETE
USING (user_id = auth.uid());

-- Bills policies
CREATE POLICY "Users can only view their own bills"
ON public.bills FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own bills"
ON public.bills FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only update their own bills"
ON public.bills FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can only delete their own bills"
ON public.bills FOR DELETE
USING (user_id = auth.uid());

-- Rent payments policies
CREATE POLICY "Users can only view their own rent payments"
ON public.rent_payments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own rent payments"
ON public.rent_payments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only update their own rent payments"
ON public.rent_payments FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can only delete their own rent payments"
ON public.rent_payments FOR DELETE
USING (user_id = auth.uid());

-- Rooms policies
CREATE POLICY "Users can only view their own rooms"
ON public.rooms FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own rooms"
ON public.rooms FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only update their own rooms"
ON public.rooms FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can only delete their own rooms"
ON public.rooms FOR DELETE
USING (user_id = auth.uid());

-- Tenants policies
CREATE POLICY "Users can only view their own tenants"
ON public.tenants FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own tenants"
ON public.tenants FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only update their own tenants"
ON public.tenants FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can only delete their own tenants"
ON public.tenants FOR DELETE
USING (user_id = auth.uid());