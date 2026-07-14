import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { generateAIResponse } from '@/lib/ai/provider';
import { guidanceAgentPrompt } from '@/lib/ai/prompts';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // 1. Fetch ALL user context from DB
    // A. Resumes
    const { data: resumes } = await supabase
      .from('resumes')
      .select('job_title, company, overall_score, ats_score, job_match, analysis_data')
      .eq('user_id', user.id);

    // B. Interview Sessions
    const { data: interviews } = await supabase
      .from('interview_sessions')
      .select('job_title, scores, feedback, type, created_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5);

    // C. Market Reports (if they exist)
    const { data: marketReports } = await supabase
      .from('career_reports')
      .select('job_title, location, ai_report')
      .eq('user_id', user.id)
      .limit(3);

    // 2. Build Aggregated Context String
    const userContext = {
      resumes: resumes || [],
      recentInterviews: interviews || [],
      marketIntelligence: marketReports || []
    };

    const aggregatedContextString = JSON.stringify(userContext, null, 2);

    // 3. Construct prompt history for NIM
    const systemPrompt = {
      role: 'system',
      content: `${guidanceAgentPrompt}\n\n=== USER CAREER DATA (JSON) ===\n${aggregatedContextString}\n========================\n`
    };

    // Ensure we only pass role/content to the AI provider
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const finalMessages = [systemPrompt, ...formattedMessages];

    // 4. Call NVIDIA NIM
    const aiResponseText = await generateAIResponse({
      messages: finalMessages,
      temperature: 0.6 // Slightly creative but grounded
    });

    return NextResponse.json({ 
      message: {
        role: "assistant",
        content: aiResponseText
      }
    });

  } catch (error) {
    console.error("Guidance Agent API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
