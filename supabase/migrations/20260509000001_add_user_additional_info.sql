-- Add user_additional_info to store user's custom context for an analysis
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS user_additional_info TEXT;
