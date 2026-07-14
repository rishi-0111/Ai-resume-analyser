import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, userAnswers } = await request.json();

    if (!sessionId || !userAnswers) {
      return NextResponse.json({ error: "Missing sessionId or userAnswers" }, { status: 400 });
    }

    // 1. Fetch original questions
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('questions')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const questions = session.questions || [];
    
    // 2. Evaluate
    let correctCount = 0;
    const evaluatedAnswers = questions.map((q, index) => {
      const userAnswer = userAnswers[index]; // Could be null if skipped due to tab switch
      const isCorrect = userAnswer === q.answer;
      if (isCorrect) correctCount++;
      return {
        question: q.question,
        userAnswer: userAnswer,
        correctAnswer: q.answer,
        isCorrect: isCorrect
      };
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    // 3. Update Session
    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({
        answers: evaluatedAnswers,
        scores: { overall: scorePercentage },
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to save results" }, { status: 500 });
    }

    return NextResponse.json({
      score: scorePercentage,
      total: questions.length,
      correct: correctCount,
      details: evaluatedAnswers
    });

  } catch (error) {
    console.error("MCQ Submit API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
