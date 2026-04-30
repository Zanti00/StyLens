-- Enable RLS
-- Users are managed by Supabase Auth (auth.users)
-- We extend with a public profile table

CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.analyses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url        TEXT NOT NULL,          -- Supabase Storage public URL
  image_path       TEXT NOT NULL,          -- Supabase Storage path (for deletion)
  style_preference TEXT NOT NULL,          -- StylePreference enum value
  weather_context  JSONB,                  -- { temp, condition, location }
  rating           SMALLINT CHECK (rating BETWEEN 1 AND 10),
  color_feedback   TEXT,
  styling_tips     TEXT[],
  overall_summary  TEXT,
  raw_llm_response JSONB,                  -- Store full LLM response for debugging
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.daily_usage (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  count      SMALLINT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/write their own profile
CREATE POLICY "profiles_own" ON public.profiles
  USING (auth.uid() = id);

-- Analyses: users can only read/write their own analyses
CREATE POLICY "analyses_own_read" ON public.analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "analyses_own_insert" ON public.analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "analyses_own_delete" ON public.analyses
  FOR DELETE USING (auth.uid() = user_id);

-- daily_usage: same user isolation
CREATE POLICY "usage_own" ON public.daily_usage
  USING (auth.uid() = user_id);

-- Profile Auto-Creation (DB Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX idx_daily_usage_user_date ON public.daily_usage(user_id, date);
