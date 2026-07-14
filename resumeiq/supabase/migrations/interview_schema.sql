-- =====================================================
-- ResumeIQ AI — Interview Module Schema Extension
-- Run this in: Supabase Studio → SQL Editor
-- Safe to run multiple times — all statements are guarded.
-- =====================================================


-- ─────────────────────────────────────────────────────
-- 1. Add missing columns to interview_sessions
-- ─────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='interview_sessions' AND column_name='type') THEN
    ALTER TABLE public.interview_sessions ADD COLUMN type TEXT DEFAULT 'hr';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='interview_sessions' AND column_name='overall_score') THEN
    ALTER TABLE public.interview_sessions ADD COLUMN overall_score INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='interview_sessions' AND column_name='started_at') THEN
    ALTER TABLE public.interview_sessions ADD COLUMN started_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='interview_sessions' AND column_name='completed_at') THEN
    ALTER TABLE public.interview_sessions ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='interview_sessions' AND column_name='duration') THEN
    ALTER TABLE public.interview_sessions ADD COLUMN duration INTEGER; -- Duration in seconds
  END IF;
END $$;


-- ─────────────────────────────────────────────────────
-- 2. Create the interview_answers table
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interview_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question        TEXT NOT NULL,
  user_answer     TEXT DEFAULT '',
  ai_feedback     JSONB,
  score           INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on interview_answers
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own interview answers"   ON public.interview_answers;
DROP POLICY IF EXISTS "Users can insert their own interview answers" ON public.interview_answers;

-- Policy: Users can view answers for sessions they own
CREATE POLICY "Users can view their own interview answers"
  ON public.interview_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions s
      WHERE s.id = interview_answers.session_id AND s.user_id = auth.uid()
    )
  );

-- Policy: Users can insert answers for sessions they own
CREATE POLICY "Users can insert their own interview answers"
  ON public.interview_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interview_sessions s
      WHERE s.id = interview_answers.session_id AND s.user_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────
-- Done! Interview schema extension complete.
-- ─────────────────────────────────────────────────────
