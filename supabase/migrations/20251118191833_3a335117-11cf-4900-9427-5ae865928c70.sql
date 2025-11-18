-- Add renewal_date column to serials table
ALTER TABLE public.serials 
ADD COLUMN renewal_date timestamp with time zone;