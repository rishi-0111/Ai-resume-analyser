-- =====================================================
-- ResumeIQ AI — Supabase Database Migration (Safe/Idempotent)
-- Run this in: Supabase Studio → SQL Editor
-- Safe to run multiple times — all statements are guarded.
-- =====================================================


-- ─────────────────────────────────────────────────────
-- 1. Extend the profiles table with required columns
--    (IF NOT EXISTS guards prevent duplicate-column errors)
-- ─────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='location') THEN
    ALTER TABLE public.profiles ADD COLUMN location TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='plan') THEN
    ALTER TABLE public.profiles ADD COLUMN plan TEXT DEFAULT 'Free';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='updated_at') THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;


-- ─────────────────────────────────────────────────────
-- 2. Enable RLS on profiles
-- ─────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- ─────────────────────────────────────────────────────
-- 3. Create the resumes table (safe — IF NOT EXISTS)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resumes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name       TEXT NOT NULL,
  file_path       TEXT NOT NULL,
  file_size       BIGINT,
  file_type       TEXT,
  job_title       TEXT DEFAULT '',
  company         TEXT DEFAULT '',
  job_description TEXT DEFAULT '',
  overall_score   INTEGER,
  ats_score       INTEGER,
  job_match       INTEGER,
  status          TEXT DEFAULT 'uploaded',
  uploaded_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add new AI analysis columns if they don't exist yet
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resumes' AND column_name='analysis_data') THEN
    ALTER TABLE public.resumes ADD COLUMN analysis_data JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resumes' AND column_name='raw_text') THEN
    ALTER TABLE public.resumes ADD COLUMN raw_text TEXT;
  END IF;
END $$;



-- ─────────────────────────────────────────────────────
-- 4. Enable RLS on resumes
-- ─────────────────────────────────────────────────────
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own resumes"   ON public.resumes;
DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;

CREATE POLICY "Users can view their own resumes"
  ON public.resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
  ON public.resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON public.resumes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON public.resumes FOR DELETE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────
-- 5. Auto-create / sync profile on new user signup
--    Uses CREATE OR REPLACE so it is always safe to rerun.
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name  = EXCLUDED.full_name,
        updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Drop any existing trigger with the same name, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────
-- 6. Create the 'resumes' storage bucket
--    ON CONFLICT (id) DO NOTHING = safe if bucket exists
-- ─────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  10485760,
  ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- 7. Storage RLS policies
-- ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes"   ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;

CREATE POLICY "Users can upload their own resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own resumes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ─────────────────────────────────────────────────────
-- 8. Create the career_reports table (Market Intelligence)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.career_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id       UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_title       TEXT NOT NULL,
  location        TEXT DEFAULT '',
  job_description TEXT DEFAULT '',
  market_data     JSONB,
  ai_report       JSONB,
  status          TEXT DEFAULT 'processing',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on career_reports
ALTER TABLE public.career_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own career reports"   ON public.career_reports;
DROP POLICY IF EXISTS "Users can insert their own career reports" ON public.career_reports;
DROP POLICY IF EXISTS "Users can update their own career reports" ON public.career_reports;
DROP POLICY IF EXISTS "Users can delete their own career reports" ON public.career_reports;

CREATE POLICY "Users can view their own career reports"
  ON public.career_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career reports"
  ON public.career_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career reports"
  ON public.career_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career reports"
  ON public.career_reports FOR DELETE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────
-- Done! Migration complete.
-- ─────────────────────────────────────────────────────
