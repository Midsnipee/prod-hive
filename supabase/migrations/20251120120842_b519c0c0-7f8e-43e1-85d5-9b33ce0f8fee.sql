-- Drop old users table that is no longer used
-- The app now uses profiles table with Supabase Auth
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop the old user_role enum if not used elsewhere
DROP TYPE IF EXISTS public.user_role CASCADE;