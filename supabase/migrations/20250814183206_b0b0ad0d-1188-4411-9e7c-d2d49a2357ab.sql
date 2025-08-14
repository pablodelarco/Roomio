-- Insert admin role for the current user
-- You'll need to replace this with your actual user ID from auth.users
-- First, let's see what users exist
INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'pablodelarco1@gmail.com';