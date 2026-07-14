import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { INTERVIEW_EVALUATOR_PROMPT } from '@/lib/services/ai/interviewPrompts';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Verify User Authentication via cookie-based session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, answers, questions } = await request.json();

    if (!sessionId || !answers || !questions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Setup Gemini AI
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 3. Construct Prompt mapped clearly for the AI
    const interviewData = questions.map(q => ({
      question: q.question,
      category: q.category,
      expectedPoints: q.expectedKeyPoints,
      candidateAnswer: answers[q.id] || "NO ANSWER PROVIDED"
    }));

    const userPrompt = `
Here is the mock interview data:

${JSON.stringify(interviewData, null, 2)}

Please evaluate this interview session completely and return the JSON payload.
    `;

    // 4. Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: INTERVIEW_EVALUATOR_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    // 5. Parse JSON Response
    let jsonString = response.text
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let evaluationData;
    try {
      evaluationData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Gemini returned invalid JSON:", jsonString);
      throw new Error("Failed to parse AI evaluation");
    }

    // 6. Update Database Session
    const { data: session, error: dbError } = await supabase
      .from('interview_sessions')
      .update({
        answers: answers,
        scores: evaluationData.scores,
        feedback: {
          strengths: evaluationData.feedback?.strengths || [],
          weaknesses: evaluationData.feedback?.weaknesses || [],
          personalizedTips: evaluationData.feedback?.personalizedTips || [],
          learningRoadmap: evaluationData.learningRoadmap || [],
          questionEvaluations: evaluationData.questionEvaluations || []
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
    return NextResponse.json(session);

  } catch (error) {
    console.error("Interview Evaluation Error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate interview", details: error.message },
      { status: 500 }
    );
  }
}
