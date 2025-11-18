-- Add order_line_id to serials table to track partial deliveries
ALTER TABLE public.serials ADD COLUMN IF NOT EXISTS order_line_id uuid REFERENCES public.order_lines(id) ON DELETE SET NULL;

-- Add delivered_quantity to order_lines to track progress
ALTER TABLE public.order_lines ADD COLUMN IF NOT EXISTS delivered_quantity integer DEFAULT 0;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_serials_order_line_id ON public.serials(order_line_id);

-- Update RLS policies for serials to ensure proper access
-- (existing policies already cover this, but we ensure they're aware of new column)