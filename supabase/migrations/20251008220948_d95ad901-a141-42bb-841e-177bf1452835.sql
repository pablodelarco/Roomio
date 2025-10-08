-- Security Fix: Restrict tenant data access to prevent cross-tenant information leakage
-- Ensure tenants can only see their own record and landlords can only see tenants in apartments they own

-- Create function to verify landlord owns the apartment where the tenant resides
CREATE OR REPLACE FUNCTION public.landlord_owns_tenant(_landlord_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.tenants t
    JOIN public.rooms r ON t.room_id = r.id
    JOIN public.apartments a ON r.apartment_id = a.id
    WHERE t.id = _tenant_id 
      AND a.user_id = _landlord_id
  )
$$;

-- Drop all existing SELECT policies on tenants
DROP POLICY IF EXISTS "Users can only view their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Landlords and tenants can view tenant records" ON public.tenants;
DROP POLICY IF EXISTS "Strict tenant access - landlords see only their tenants, tenant" ON public.tenants;
DROP POLICY IF EXISTS "Strict tenant access - landlords see only their tenants, tenants see only themselves" ON public.tenants;

-- Create strict SELECT policy
CREATE POLICY "secure_tenant_select"
ON public.tenants FOR SELECT
USING (
  -- Landlord can see this tenant only if they own the apartment
  (auth.uid() IS NOT NULL AND public.landlord_owns_tenant(auth.uid(), id))
  OR
  -- Tenant can see only their own record
  (tenant_user_id = auth.uid() AND tenant_user_id IS NOT NULL)
);

-- Drop all existing UPDATE policies on tenants
DROP POLICY IF EXISTS "Users can only update their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Landlords can update tenant records, tenants can update own contact info" ON public.tenants;
DROP POLICY IF EXISTS "Landlords can update tenant records, tenants can update own con" ON public.tenants;
DROP POLICY IF EXISTS "Landlords update their tenants, tenants update own contact only" ON public.tenants;

-- Create strict UPDATE policy
CREATE POLICY "secure_tenant_update"
ON public.tenants FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND public.landlord_owns_tenant(auth.uid(), id))
  OR
  (tenant_user_id = auth.uid() AND tenant_user_id IS NOT NULL)
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND public.landlord_owns_tenant(auth.uid(), id))
  OR
  (tenant_user_id = auth.uid() AND tenant_user_id IS NOT NULL)
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_tenants_room_id ON public.tenants(room_id);

-- Add documentation
COMMENT ON FUNCTION public.landlord_owns_tenant IS 'Verifies landlord owns the apartment containing the tenant. Prevents cross-tenant PII access.';