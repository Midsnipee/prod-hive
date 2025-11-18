-- Add "Télétravail" status to serial_status enum
ALTER TYPE serial_status ADD VALUE IF NOT EXISTS 'Télétravail';