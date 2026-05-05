-- Add title column to analyses table
-- Default to 'Style Analysis' for existing records
ALTER TABLE public.analyses ADD COLUMN title TEXT DEFAULT 'Style Analysis';
