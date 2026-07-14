-- =====================================================
-- ResumeIQ AI — Conversational Interview Schema Extension
-- Run this in: Supabase Studio → SQL Editor
-- Safe to run multiple times — all statements are guarded.
-- =====================================================

DO $$
BEGIN
  -- 1. Domain (e.g., Frontend, Backend, Java)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='interview_sessions' AND column_name='domain') THEN
    ALTER TABLE public.interview_sessions ADD COLUMN domain TEXT;
  END IF;

  -- 2. Experience Level (e.g., Fresher, Senior)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='interview_sessions' AND column_name='experience_level') THEN
    ALTER TABLE public.interview_sessions ADD COLUMN experience_level TEXT;
  END IF;

  -- 3. Target Company (e.g., Google, Amazon)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='interview_sessions' AND column_name='target_company') THEN
    ALTER TABLE public.interview_sessions ADD COLUMN target_company TEXT;
  END IF;

  -- 4. Chat Messages History
  -- To store the live conversational transcript
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='interview_sessions' AND column_name='messages') THEN
    ALTER TABLE public.interview_sessions ADD COLUMN messages JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;
