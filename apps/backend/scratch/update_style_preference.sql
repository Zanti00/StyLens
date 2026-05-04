-- Update style_preference to be an array of text
-- This allows multiple style categories to be stored for a single analysis
ALTER TABLE public.analyses 
ALTER COLUMN style_preference TYPE TEXT[] 
USING ARRAY[style_preference];
