-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE material_category AS ENUM ('PC Portable', 'Fixe', 'Écran', 'Clavier', 'Souris', 'Casque', 'Webcam', 'Autre');
CREATE TYPE serial_status AS ENUM ('En stock', 'Attribué', 'En réparation', 'Retiré');
CREATE TYPE order_status AS ENUM ('Demandé', 'Circuit interne', 'Commande fournisseur faite', 'Livré');
CREATE TYPE user_role AS ENUM ('admin', 'magasinier', 'acheteur', 'lecteur');

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category material_category NOT NULL,
  manufacturer TEXT,
  model TEXT,
  description TEXT,
  unit_price DECIMAL(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create serials table
CREATE TABLE public.serials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_number TEXT NOT NULL UNIQUE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  status serial_status NOT NULL DEFAULT 'En stock',
  purchase_date TIMESTAMPTZ,
  warranty_end TIMESTAMPTZ,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT NOT NULL UNIQUE,
  supplier TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status order_status NOT NULL DEFAULT 'Demandé',
  site TEXT,
  requested_by TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create order_lines table
CREATE TABLE public.order_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
  material_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create order_files table for PDF attachments
CREATE TABLE public.order_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_id UUID NOT NULL REFERENCES public.serials(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  department TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  renewal_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL,
  department TEXT,
  site TEXT,
  role user_role NOT NULL DEFAULT 'lecteur',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access for now, we'll add proper auth later)
CREATE POLICY "Enable read access for all users" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.suppliers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.suppliers FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.materials FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.materials FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.serials FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.serials FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.serials FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.serials FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.order_lines FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.order_lines FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.order_lines FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.order_lines FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.order_files FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.order_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.order_files FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.order_files FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.assignments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.assignments FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.users FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_serials_material_id ON public.serials(material_id);
CREATE INDEX idx_serials_status ON public.serials(status);
CREATE INDEX idx_order_lines_order_id ON public.order_lines(order_id);
CREATE INDEX idx_order_files_order_id ON public.order_files(order_id);
CREATE INDEX idx_assignments_serial_id ON public.assignments(serial_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_materials_category ON public.materials(category);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_serials_updated_at BEFORE UPDATE ON public.serials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();