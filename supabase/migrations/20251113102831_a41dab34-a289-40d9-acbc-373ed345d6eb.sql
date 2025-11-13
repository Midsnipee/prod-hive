-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'magasinier', 'acheteur', 'lecteur');

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  department TEXT,
  site TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can view all profiles but only update their own
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies: only viewable, not modifiable by regular users
CREATE POLICY "Anyone can view user roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, email, display_name, department, site)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'site'
  );
  
  -- Assign default 'lecteur' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'lecteur');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for all tables to use auth
-- Drop existing permissive policies and create secure ones

-- Materials: everyone authenticated can read, only admin and magasinier can modify
DROP POLICY IF EXISTS "Enable read access for all users" ON public.materials;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.materials;
DROP POLICY IF EXISTS "Enable update for all users" ON public.materials;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.materials;

CREATE POLICY "Authenticated users can view materials"
ON public.materials FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin and magasinier can insert materials"
ON public.materials FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'magasinier')
);

CREATE POLICY "Admin and magasinier can update materials"
ON public.materials FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'magasinier')
);

CREATE POLICY "Admin can delete materials"
ON public.materials FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Suppliers: similar to materials
DROP POLICY IF EXISTS "Enable read access for all users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable update for all users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.suppliers;

CREATE POLICY "Authenticated users can view suppliers"
ON public.suppliers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin and acheteur can manage suppliers"
ON public.suppliers FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'acheteur')
);

-- Orders: authenticated users can view, admin and acheteur can manage
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.orders;

CREATE POLICY "Authenticated users can view orders"
ON public.orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin and acheteur can manage orders"
ON public.orders FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'acheteur')
);

-- Order lines: same as orders
DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_lines;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.order_lines;
DROP POLICY IF EXISTS "Enable update for all users" ON public.order_lines;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.order_lines;

CREATE POLICY "Authenticated users can view order lines"
ON public.order_lines FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin and acheteur can manage order lines"
ON public.order_lines FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'acheteur')
);

-- Order files: same as orders
DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_files;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.order_files;
DROP POLICY IF EXISTS "Enable update for all users" ON public.order_files;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.order_files;

CREATE POLICY "Authenticated users can view order files"
ON public.order_files FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin and acheteur can manage order files"
ON public.order_files FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'acheteur')
);

-- Serials: authenticated can view, admin and magasinier can manage
DROP POLICY IF EXISTS "Enable read access for all users" ON public.serials;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.serials;
DROP POLICY IF EXISTS "Enable update for all users" ON public.serials;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.serials;

CREATE POLICY "Authenticated users can view serials"
ON public.serials FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin and magasinier can manage serials"
ON public.serials FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'magasinier')
);

-- Assignments: authenticated can view, admin and magasinier can manage
DROP POLICY IF EXISTS "Enable read access for all users" ON public.assignments;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.assignments;
DROP POLICY IF EXISTS "Enable update for all users" ON public.assignments;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.assignments;

CREATE POLICY "Authenticated users can view assignments"
ON public.assignments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin and magasinier can manage assignments"
ON public.assignments FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'magasinier')
);

-- Drop old users table policies (we'll keep the table for now for data migration)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.users;
DROP POLICY IF EXISTS "Enable update for all users" ON public.users;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.users;

-- Lock down the old users table - no one should access it anymore
CREATE POLICY "No access to old users table"
ON public.users FOR ALL
TO authenticated
USING (false);