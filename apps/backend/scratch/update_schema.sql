-- Update the analyses table to include detailed feedback fields
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS color_analysis JSONB,
ADD COLUMN IF NOT EXISTS fit_proportion_analysis TEXT,
ADD COLUMN IF NOT EXISTS style_notes_tips TEXT[]; -- PostgreSQL array of strings

-- Update existing dummy data if necessary (optional)
UPDATE public.analyses 
SET 
    color_analysis = '{"hex_codes": ["#1e293b", "#64748b", "#cbd5e1", "#f8fafc", "#f43f5e"], "verdict": "Excellent use of neutral tones with a subtle pop of rose for visual interest."}'::jsonb,
    fit_proportion_analysis = 'The silhouette is well-defined. The cropped jacket perfectly complements the high-waisted trousers.',
    style_notes_tips = ARRAY['Try adding a silver necklace to enhance the cool tones.', 'Roll up the sleeves slightly for a more relaxed, effortless vibe.', 'The footwear choice is solid, but white sneakers would make this more casual.']
WHERE style_preference IS NOT NULL;
