-- =====================================================
-- ResumeIQ AI — Add Difficulty and Question Count
-- Run this in: Supabase Studio → SQL Editor
-- Safe to run multiple times — all statements are guarded.
-- =====================================================

DO $$
BEGIN
  -- 1. Difficulty Level (e.g., Easy, Medium, Hard)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='interview_sessions' AND column_name='difficulty') THEN
    ALTER TABLE public.interview_sessions ADD COLUMN difficulty TEXT DEFAULT 'Medium';
  END IF;

  -- 2. Question Count (e.g., 5, 10)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='interview_sessions' AND column_name='question_count') THEN
    ALTER TABLE public.interview_sessions ADD COLUMN question_count INTEGER DEFAULT 5;
  END IF;

END $$;
