-- Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  image_urls   TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'folders_own_read') THEN
        CREATE POLICY "folders_own_read" ON public.folders FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'folders_own_insert') THEN
        CREATE POLICY "folders_own_insert" ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'folders_own_update') THEN
        CREATE POLICY "folders_own_update" ON public.folders FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'folders_own_delete') THEN
        CREATE POLICY "folders_own_delete" ON public.folders FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('closet', 'closet', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Simplified for public read, user-restricted write)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'closet_upload') THEN
        CREATE POLICY "closet_upload" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'closet' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'closet_read') THEN
        CREATE POLICY "closet_read" ON storage.objects
          FOR SELECT USING (bucket_id = 'closet');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'closet_delete') THEN
        CREATE POLICY "closet_delete" ON storage.objects
          FOR DELETE USING (bucket_id = 'closet' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_folders') THEN
        CREATE TRIGGER set_updated_at_folders
        BEFORE UPDATE ON public.folders
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
