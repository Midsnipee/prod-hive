-- Seed file for local development and database regeneration
-- This file creates demo users for testing purposes

-- Note: This seed file should be run AFTER all migrations
-- It requires Supabase Auth to be properly configured

-- The users will be created via the seed-demo-users edge function
-- or manually via Supabase dashboard/CLI with the following credentials:

-- Admin User
-- Email: admin@stock.local
-- Password: admin123
-- Display Name: Administrateur
-- Department: IT
-- Site: Siège
-- Role: admin

-- Magasinier User
-- Email: magasinier@stock.local
-- Password: mag123
-- Display Name: Jean Dupont
-- Department: Logistique
-- Site: Entrepôt A
-- Role: magasinier

-- Acheteur User
-- Email: acheteur@stock.local
-- Password: ach123
-- Display Name: Marie Martin
-- Department: Achats
-- Site: Siège
-- Role: acheteur

-- Lecteur User
-- Email: lecteur@stock.local
-- Password: lec123
-- Display Name: Pierre Durand
-- Department: Commercial
-- Site: Agence B
-- Role: lecteur

-- To create these users, you have two options:

-- Option 1: Use the seed-demo-users edge function (recommended for Lovable Cloud)
-- This is automatically called when the app starts if no users exist

-- Option 2: Use Supabase CLI (for local development)
-- Run: supabase db seed

-- Option 3: Manual creation via SQL (requires service role)
-- See docs/ADMIN_SETUP.md for detailed instructions

-- Sample data for testing (optional)
-- Uncomment and modify as needed for your use case

-- INSERT INTO public.suppliers (name, contact, email, phone, address) VALUES
--   ('Dell France', 'Service Commercial', 'contact@dell.fr', '01 23 45 67 89', '123 Rue de la Tech, 75001 Paris'),
--   ('HP Enterprise', 'Marie Dubois', 'marie.dubois@hp.com', '01 98 76 54 32', '456 Avenue Innovation, 92100 Boulogne');

-- INSERT INTO public.materials (name, category, manufacturer, model, description, stock, min_stock, unit_price) VALUES
--   ('Dell Latitude 7420', 'PC Portable', 'Dell', 'Latitude 7420', 'PC portable professionnel 14" - i7-1185G7, 16GB RAM, 512GB SSD', 10, 5, 1299.99),
--   ('HP EliteDesk 800 G8', 'Fixe', 'HP', 'EliteDesk 800 G8', 'PC fixe tour - i7-11700, 16GB RAM, 512GB SSD', 8, 3, 999.99),
--   ('Dell UltraSharp U2720Q', 'Écran', 'Dell', 'U2720Q', 'Écran 27" 4K IPS USB-C', 15, 10, 599.99),
--   ('Logitech MX Keys', 'Clavier', 'Logitech', 'MX Keys', 'Clavier sans fil rétroéclairé', 20, 15, 99.99),
--   ('Logitech MX Master 3S', 'Souris', 'Logitech', 'MX Master 3S', 'Souris sans fil ergonomique', 25, 20, 89.99);
