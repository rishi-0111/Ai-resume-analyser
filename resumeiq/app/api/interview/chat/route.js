import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateAIResponse } from '@/lib/ai/provider';
import { conversationalHRPrompt, conversationalTechPrompt } from '@/lib/ai/prompts';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Verify User Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, message } = await request.json();

    if (!sessionId || !message) {
      return NextResponse.json({ error: "Missing required fields: sessionId and message" }, { status: 400 });
    }

    // 2. Fetch Session Data
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('feedback, questions')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const currentMessages = session.questions || [];
    const meta = session.feedback || {};

    // Append user message
    const userMessageObj = { role: "user", content: message, timestamp: new Date().toISOString() };
    const updatedMessages = [...currentMessages, userMessageObj];

    // 3. Prepare payload for AI Provider
    const systemPrompt = meta.type === 'technical' ? conversationalTechPrompt : conversationalHRPrompt;
    
    // Convert our internal DB message structure to what the NVIDIA API expects
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...updatedMessages.map(msg => ({
        role: msg.role === 'system' ? 'user' : msg.role, // Some APIs are strict about system messages. Our context is stored as "system", so we pass it as "user" instruction if needed, but NVIDIA allows "system".
        content: msg.content
      }))
    ];

    // Ensure the hidden context message is treated correctly
    // Actually, LLaMa accepts multiple system messages or we can just send it as 'user' role with hidden flag.
    const cleanApiMessages = apiMessages.map(m => {
      // If it's the hidden context message we created in init, map it to user role to be safe,
      // because Llama 3 handles multiple system prompts but it's cleaner this way.
      if (m.isHidden || m.content.startsWith("Target Job Title:")) {
        return { role: "user", content: `[Context Information for Interviewer]\n${m.content}` };
      }
      return { role: m.role, content: m.content };
    });

    // Calculate how many questions AI has asked
    const assistantMessageCount = updatedMessages.filter(m => m.role === 'assistant').length;
    const isLastQuestion = assistantMessageCount >= (meta.question_count || 5);
    
    let injectedInstruction = `\n[System Note: This interview is set to ${meta.difficulty || 'Medium'} difficulty.`;
    if (isLastQuestion) {
      injectedInstruction += ` You have reached the requested question limit. Do not ask any more questions. Politely conclude the interview and thank the candidate.]`;
    } else {
      injectedInstruction += ` You have asked ${assistantMessageCount} questions out of ${meta.question_count || 5}.]`;
    }

    // Append to the last user message so the AI pays attention to it
    cleanApiMessages[cleanApiMessages.length - 1].content += injectedInstruction;

    // 4. Call NVIDIA NIM
    const aiResponseText = await generateAIResponse({
      messages: cleanApiMessages,
      temperature: 0.7,
      maxTokens: 500,
      isJson: false
    });

    if (!aiResponseText) {
      throw new Error("AI returned empty response.");
    }

    // Append AI message
    const aiMessageObj = { role: "assistant", content: aiResponseText, timestamp: new Date().toISOString() };
    const finalMessages = [...updatedMessages, aiMessageObj];

    // 5. Save back to Database
    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({ questions: finalMessages })
      .eq('id', sessionId);

    if (updateError) {
      console.error("Supabase Error:", updateError);
      throw new Error("Failed to update session messages");
    }

    return NextResponse.json({ message: aiMessageObj });

  } catch (error) {
    console.error("Interview Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to generate chat response", details: error.message },
      { status: 500 }
    );
  }
}
