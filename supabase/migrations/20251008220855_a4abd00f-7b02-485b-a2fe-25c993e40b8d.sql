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

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Landlords and tenants can view tenant records" ON public.tenants;

-- Create strict SELECT policy: Landlords can only see tenants in their apartments, tenants only their own record
CREATE POLICY "Strict tenant access - landlords see only their tenants, tenants see only themselves"
ON public.tenants FOR SELECT
USING (
  -- Landlord can see this tenant only if they own the apartment
  (auth.uid() IS NOT NULL AND public.landlord_owns_tenant(auth.uid(), id))
  OR
  -- Tenant can see only their own record
  (tenant_user_id = auth.uid() AND tenant_user_id IS NOT NULL)
);

-- Update the UPDATE policy to be more explicit
DROP POLICY IF EXISTS "Landlords can update tenant records, tenants can update own contact info" ON public.tenants;

CREATE POLICY "Landlords update their tenants, tenants update own contact only"
ON public.tenants FOR UPDATE
USING (
  -- Landlord can update if they own the apartment
  (auth.uid() IS NOT NULL AND public.landlord_owns_tenant(auth.uid(), id))
  OR
  -- Tenant can update only their own record (restricted columns enforced at app level)
  (tenant_user_id = auth.uid() AND tenant_user_id IS NOT NULL)
)
WITH CHECK (
  -- Same conditions for the updated data
  (auth.uid() IS NOT NULL AND public.landlord_owns_tenant(auth.uid(), id))
  OR
  (tenant_user_id = auth.uid() AND tenant_user_id IS NOT NULL)
);

-- Add index for performance on tenant lookups
CREATE INDEX IF NOT EXISTS idx_tenants_room_id ON public.tenants(room_id);

-- Add comment for documentation
COMMENT ON FUNCTION public.landlord_owns_tenant IS 'Verifies that a landlord owns the apartment containing the specified tenant. Used in RLS policies to prevent cross-tenant data access.';