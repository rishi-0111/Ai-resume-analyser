import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateAIResponse } from '@/lib/ai/provider';
import { interviewFeedbackPrompt } from '@/lib/ai/prompts';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Verify User Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, duration } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Fetch the session and transcript
    const { data: session, error: dbErrorFetch } = await supabase
      .from('interview_sessions')
      .select('messages, type, domain, job_title')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (dbErrorFetch || !session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const messages = session.messages || [];
    
    // Filter out hidden system context and format as a readable transcript
    const transcript = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
      .join('\n\n');

    const userPrompt = `
Here is the transcript of a ${session.type} interview for the role of ${session.job_title}.

--- TRANSCRIPT START ---
${transcript}
--- TRANSCRIPT END ---

Please evaluate this interview session completely and provide comprehensive feedback on the candidate's performance.
    `;

    // 3. Call NVIDIA NIM Provider for Interview Feedback
    const evaluationData = await generateAIResponse({
      systemPrompt: interviewFeedbackPrompt,
      userPrompt,
      temperature: 0.2, // Low temperature for analytical evaluation
      maxTokens: 2000,
    });

    // 4. Update Database Session
    const { data: updatedSession, error: dbError } = await supabase
      .from('interview_sessions')
      .update({
        overall_score: evaluationData.overallScore,
        duration: duration || 0,
        completed_at: new Date().toISOString(),
        scores: { overall: evaluationData.overallScore },
        feedback: {
          communication: evaluationData.communication,
          technicalKnowledge: evaluationData.technicalKnowledge,
          confidence: evaluationData.confidence,
          problemSolving: evaluationData.problemSolving,
          suggestions: evaluationData.suggestions || [],
          nextLearningTopics: evaluationData.nextLearningTopics || []
        },
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (dbError) {
      console.error("Supabase Error:", dbError);
      throw new Error("Failed to update session with evaluation results");
    }

    console.log("✓ Interview evaluation complete for session:", sessionId);
    return NextResponse.json(updatedSession);

  } catch (error) {
    console.error("Interview Evaluation Error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate interview", details: error.message },
      { status: 500 }
    );
  }
}
