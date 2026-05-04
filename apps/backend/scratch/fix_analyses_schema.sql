-- Fix analyses table to match the current mock flow and backend requirements
-- 1. Add missing columns
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS color_analysis JSONB,
ADD COLUMN IF NOT EXISTS fit_proportion_analysis TEXT,
ADD COLUMN IF NOT EXISTS style_notes_tips TEXT[],
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 2. Make style_preference optional (it's currently NOT NULL but missing in mock flow)
ALTER TABLE public.analyses ALTER COLUMN style_preference DROP NOT NULL;

-- 3. (Optional) Clear old data if schema conflicts were causing issues
-- DELETE FROM public.analyses WHERE status = 'mocked';
