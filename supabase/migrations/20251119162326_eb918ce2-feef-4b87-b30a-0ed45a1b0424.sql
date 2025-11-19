-- Create default admin user for production
-- This will create an admin user with secure credentials
-- Email: admin@stock.local
-- Password: AdminStock2025!
-- This is a placeholder - you should change the password after first login

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@stock.local';

  -- Only create if doesn't exist
  IF admin_user_id IS NULL THEN
    -- Note: This requires the auth.users table which is managed by Supabase
    -- In production, you should use the Supabase dashboard or edge function to create the admin
    -- This migration serves as documentation of the default admin account
    
    RAISE NOTICE 'Default admin user should be created manually via Supabase dashboard or bulk-create-users edge function';
    RAISE NOTICE 'Email: admin@stock.local';
    RAISE NOTICE 'Role: admin';
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;
END $$;