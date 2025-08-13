-- Create role-based access control system for property management app
-- This fixes the security vulnerability where all authenticated users can access tenant data

-- 1. Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'property_manager', 'tenant');

-- 2. Create user_roles table to manage user permissions
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Create function to check if user is admin or property manager
CREATE OR REPLACE FUNCTION public.is_property_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'property_manager')
  )
$$;

-- 5. Update RLS policies for all tables to restrict to property managers only

-- Tenants table - only property managers can access
DROP POLICY IF EXISTS "Allow select to authenticated" ON public.tenants;
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.tenants;
DROP POLICY IF EXISTS "Allow update to authenticated" ON public.tenants;
DROP POLICY IF EXISTS "Allow delete to authenticated" ON public.tenants;

CREATE POLICY "Property managers can view tenants" ON public.tenants 
FOR SELECT USING (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can insert tenants" ON public.tenants 
FOR INSERT WITH CHECK (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can update tenants" ON public.tenants 
FOR UPDATE USING (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can delete tenants" ON public.tenants 
FOR DELETE USING (public.is_property_manager(auth.uid()));

-- Apartments table - only property managers can access
DROP POLICY IF EXISTS "Allow select to authenticated" ON public.apartments;
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.apartments;
DROP POLICY IF EXISTS "Allow update to authenticated" ON public.apartments;
DROP POLICY IF EXISTS "Allow delete to authenticated" ON public.apartments;

CREATE POLICY "Property managers can view apartments" ON public.apartments 
FOR SELECT USING (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can insert apartments" ON public.apartments 
FOR INSERT WITH CHECK (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can update apartments" ON public.apartments 
FOR UPDATE USING (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can delete apartments" ON public.apartments 
FOR DELETE USING (public.is_property_manager(auth.uid()));

-- Rooms table - only property managers can access
DROP POLICY IF EXISTS "Allow select to authenticated" ON public.rooms;
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.rooms;
DROP POLICY IF EXISTS "Allow update to authenticated" ON public.rooms;
DROP POLICY IF EXISTS "Allow delete to authenticated" ON public.rooms;

CREATE POLICY "Property managers can view rooms" ON public.rooms 
FOR SELECT USING (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can insert rooms" ON public.rooms 
FOR INSERT WITH CHECK (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can update rooms" ON public.rooms 
FOR UPDATE USING (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can delete rooms" ON public.rooms 
FOR DELETE USING (public.is_property_manager(auth.uid()));

-- Rent payments table - only property managers can access
DROP POLICY IF EXISTS "Allow select to authenticated" ON public.rent_payments;
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.rent_payments;
DROP POLICY IF EXISTS "Allow update to authenticated" ON public.rent_payments;
DROP POLICY IF EXISTS "Allow delete to authenticated" ON public.rent_payments;

CREATE POLICY "Property managers can view rent payments" ON public.rent_payments 
FOR SELECT USING (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can insert rent payments" ON public.rent_payments 
FOR INSERT WITH CHECK (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can update rent payments" ON public.rent_payments 
FOR UPDATE USING (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can delete rent payments" ON public.rent_payments 
FOR DELETE USING (public.is_property_manager(auth.uid()));

-- Bills table - only property managers can access
DROP POLICY IF EXISTS "Allow select to authenticated" ON public.bills;
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.bills;
DROP POLICY IF EXISTS "Allow update to authenticated" ON public.bills;
DROP POLICY IF EXISTS "Allow delete to authenticated" ON public.bills;

CREATE POLICY "Property managers can view bills" ON public.bills 
FOR SELECT USING (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can insert bills" ON public.bills 
FOR INSERT WITH CHECK (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can update bills" ON public.bills 
FOR UPDATE USING (public.is_property_manager(auth.uid()));

CREATE POLICY "Property managers can delete bills" ON public.bills 
FOR DELETE USING (public.is_property_manager(auth.uid()));

-- User roles table policies - users can only see their own roles, admins can see all
CREATE POLICY "Users can view their own roles" ON public.user_roles 
FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles 
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" ON public.user_roles 
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles 
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updating user_roles updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default admin role for the first user (you'll need to update this with actual user ID)
-- This is commented out since we don't know the user ID yet
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('your-user-id-here', 'admin');