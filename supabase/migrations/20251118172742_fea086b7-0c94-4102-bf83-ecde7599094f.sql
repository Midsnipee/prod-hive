-- Create storage bucket for order files
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-files', 'order-files', false);

-- Create RLS policies for order files bucket
CREATE POLICY "Authenticated users can view order files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'order-files' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Admin and acheteur can upload order files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'order-files' AND
  (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'acheteur')
    )
  )
);

CREATE POLICY "Admin and acheteur can delete order files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'order-files' AND
  (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'acheteur')
    )
  )
);