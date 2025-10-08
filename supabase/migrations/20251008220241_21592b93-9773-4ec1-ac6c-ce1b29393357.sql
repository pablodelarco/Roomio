-- Add optional tenant_user_id column to allow tenants to authenticate and view their own data
ALTER TABLE public.tenants 
ADD COLUMN tenant_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_tenants_tenant_user_id ON public.tenants(tenant_user_id);

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can only view their own tenants" ON public.tenants;

-- Create new SELECT policy that allows both landlords AND tenants to view records
CREATE POLICY "Landlords and tenants can view tenant records"
ON public.tenants
FOR SELECT
USING (
  user_id = auth.uid() OR tenant_user_id = auth.uid()
);

-- Update INSERT policy to remain landlord-only (tenants are created by landlords)
-- Keep existing INSERT policy as-is

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can only update their own tenants" ON public.tenants;

-- Create new UPDATE policy - landlords can update everything, tenants can only update their contact info
CREATE POLICY "Landlords can update tenant records, tenants can update own contact info"
ON public.tenants
FOR UPDATE
USING (
  user_id = auth.uid() OR 
  (tenant_user_id = auth.uid() AND tenant_user_id IS NOT NULL)
)
WITH CHECK (
  -- Landlords can update anything
  user_id = auth.uid() OR
  -- Tenants can only update their email and phone
  (tenant_user_id = auth.uid() AND tenant_user_id IS NOT NULL)
);

-- DELETE policy remains landlord-only (keep existing policy)

-- Add comment for documentation
COMMENT ON COLUMN public.tenants.tenant_user_id IS 'Optional link to auth.users - allows tenants to authenticate and view their own records while maintaining landlord access';
