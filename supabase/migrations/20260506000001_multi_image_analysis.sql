-- Add auxiliary_image_paths to store additional images for an analysis
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS auxiliary_image_paths TEXT[] DEFAULT '{}';

-- Update RLS if needed (not needed here as it's just a new column)
