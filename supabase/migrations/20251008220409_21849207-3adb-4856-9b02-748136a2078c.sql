-- Security Fix: Complete RLS policy updates
-- Handle existing objects gracefully

-- Add tenant_user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tenants' 
    AND column_name = 'tenant_user_id'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN tenant_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX idx_tenants_tenant_user_id ON public.tenants(tenant_user_id);
    COMMENT ON COLUMN public.tenants.tenant_user_id IS 'Optional link to auth.users - allows tenants to authenticate and view their own records';
  END IF;
END $$;

-- Drop and recreate tenants policies
DROP POLICY IF EXISTS "Users can only view their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Landlords and tenants can view tenant records" ON public.tenants;

CREATE POLICY "Landlords and tenants can view tenant records"
ON public.tenants FOR SELECT
USING (user_id = auth.uid() OR tenant_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can only update their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Landlords can update tenant records, tenants can update own contact info" ON public.tenants;

CREATE POLICY "Landlords can update tenant records, tenants can update own contact info"
ON public.tenants FOR UPDATE
USING (user_id = auth.uid() OR (tenant_user_id = auth.uid() AND tenant_user_id IS NOT NULL))
WITH CHECK (user_id = auth.uid() OR (tenant_user_id = auth.uid() AND tenant_user_id IS NOT NULL));

-- Create ownership verification function
CREATE OR REPLACE FUNCTION public.user_owns_tenant_apartment(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenants t
    JOIN public.rooms r ON t.room_id = r.id
    JOIN public.apartments a ON r.apartment_id = a.id
    WHERE t.id = _tenant_id AND a.user_id = _user_id
  )
$$;

-- Drop and recreate rent_payments policies
DROP POLICY IF EXISTS "Users can only view their own rent payments" ON public.rent_payments;
DROP POLICY IF EXISTS "Users can only insert their own rent payments" ON public.rent_payments;
DROP POLICY IF EXISTS "Users can only update their own rent payments" ON public.rent_payments;
DROP POLICY IF EXISTS "Users can only delete their own rent payments" ON public.rent_payments;
DROP POLICY IF EXISTS "Landlords and tenants can view rent payments" ON public.rent_payments;
DROP POLICY IF EXISTS "Landlords can create rent payments for their tenants" ON public.rent_payments;
DROP POLICY IF EXISTS "Landlords can update rent payments for their tenants" ON public.rent_payments;
DROP POLICY IF EXISTS "Landlords can delete rent payments for their tenants" ON public.rent_payments;

CREATE POLICY "Landlords and tenants can view rent payments"
ON public.rent_payments FOR SELECT
USING (
  user_id = auth.uid() OR
  public.user_owns_tenant_apartment(auth.uid(), tenant_id) OR
  tenant_id IN (SELECT id FROM public.tenants WHERE tenant_user_id = auth.uid())
);

CREATE POLICY "Landlords can create rent payments for their tenants"
ON public.rent_payments FOR INSERT
WITH CHECK (user_id = auth.uid() AND public.user_owns_tenant_apartment(auth.uid(), tenant_id));

CREATE POLICY "Landlords can update rent payments for their tenants"
ON public.rent_payments FOR UPDATE
USING (user_id = auth.uid() AND public.user_owns_tenant_apartment(auth.uid(), tenant_id));

CREATE POLICY "Landlords can delete rent payments for their tenants"
ON public.rent_payments FOR DELETE
USING (user_id = auth.uid() AND public.user_owns_tenant_apartment(auth.uid(), tenant_id));