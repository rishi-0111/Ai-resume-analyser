import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { extractTextFromFile } from '@/lib/services/ai/extractor';
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

    const { type, resumeId, jobTitle, jobDescription, domain, experienceLevel, targetCompany, difficulty, questionCount, concepts, interviewerPersona } = await request.json();

    if (!jobTitle) {
      return NextResponse.json({ error: "Missing required field: jobTitle" }, { status: 400 });
    }

    let resumeText = null;

    // 2. Fetch and Extract Resume (if provided)
    if (resumeId) {
      const { data: resume, error: dbError } = await supabase
        .from('resumes')
        .select('raw_text, file_path, file_name')
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single();

      if (dbError || !resume) {
        return NextResponse.json({ error: "Resume not found." }, { status: 404 });
      }

      resumeText = resume.raw_text;

      // Fallback extraction
      if (!resumeText || resumeText.trim().length < 50) {
        console.log("raw_text missing — re-extracting from storage...");
        if (resume.file_path) {
          const { data: fileData, error: downloadError } = await supabase.storage.from("resumes").download(resume.file_path);
          if (!downloadError && fileData) {
            try {
              const arrayBuffer = await fileData.arrayBuffer();
              const nodeBuffer = Buffer.from(arrayBuffer);
              resumeText = await extractTextFromFile(nodeBuffer, resume.file_name);
              resumeText = resumeText.replace(/\s+/g, ' ').trim();
              if (resumeText.length >= 50) {
                await supabase.from("resumes").update({ raw_text: resumeText }).eq("id", resumeId);
              }
            } catch (e) {
              console.error("Fallback extraction failed:", e);
            }
          }
        }
      }
    }

    // 3. Build Initial System Prompt & Context
    const systemPrompt = type === 'technical' ? conversationalTechPrompt : conversationalHRPrompt;
    
    let contextPrompt = `Target Job Title: ${jobTitle}\n`;
    if (domain) contextPrompt += `Target Technical Domain: ${domain}\n`;
    if (experienceLevel) contextPrompt += `Candidate Experience Level: ${experienceLevel}\n`;
    if (targetCompany) contextPrompt += `Target Company/Style: ${targetCompany}\n`;
    if (jobDescription) contextPrompt += `Job Description: ${jobDescription}\n`;
    if (difficulty) contextPrompt += `Difficulty Level: ${difficulty}\n`;
    if (questionCount) contextPrompt += `Total Questions to Ask: ${questionCount}\n`;
    if (concepts) contextPrompt += `CRITICAL: The user has explicitly requested you to focus heavily on the following specific concepts: [${concepts}]. Make sure the majority of your questions revolve around these topics.\n`;
    if (resumeText) contextPrompt += `\n--- CANDIDATE RESUME ---\n${resumeText}\n------------------------\n`;
    
    if (interviewerPersona === 'Male') {
      contextPrompt += `\nAdopt a male persona for this interview (e.g. David, John). Introduce yourself with a male name.`;
    } else if (interviewerPersona === 'Female') {
      contextPrompt += `\nAdopt a female persona for this interview (e.g. Sarah, Emma). Introduce yourself with a female name.`;
    }

    contextPrompt += `\nBegin the interview now. Greet the candidate professionally, introduce yourself briefly, and ask the first question.`;

    const initialMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: contextPrompt }
    ];

    // 4. Generate AI's First Response (Greeting + First Question)
    const firstAiResponse = await generateAIResponse({
      messages: initialMessages,
      temperature: 0.7,
      maxTokens: 500,
      isJson: false // Expecting natural text
    });

    if (!firstAiResponse) {
      throw new Error("AI failed to generate initial response.");
    }

    // Combine system instructions with the actual conversation to save in DB
    // To save tokens in the future, we only save the conversation, but inject the system prompt on each request.
    const messagesToSave = [
      { role: "assistant", content: firstAiResponse, timestamp: new Date().toISOString() }
    ];

    // 5. Save to Database
    const { data: session, error: sessionDbError } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        resume_id: resumeId || null,
        job_title: jobTitle,
        job_description: jobDescription || '',
        feedback: {
          type: type || 'hr',
          domain: domain || null,
          experience_level: experienceLevel || null,
          target_company: targetCompany || null,
          difficulty: difficulty || 'Medium',
          question_count: questionCount || 5,
          interviewer_persona: interviewerPersona || 'Male',
        },
        status: 'in_progress'
      })
      .select()
      .single();

    if (sessionDbError) {
      console.error("Supabase Error:", sessionDbError);
      throw new Error("Failed to save session to database");
    }

    console.log(`✓ Conversational Interview session created: ${session.id}`);

    const fullMessages = [
      { role: "system", content: contextPrompt, isHidden: true },
      { role: "assistant", content: firstAiResponse, timestamp: new Date().toISOString() }
    ];
    
    // Save messages into 'questions' column since 'messages' column doesn't exist
    await supabase.from('interview_sessions').update({ questions: fullMessages }).eq('id', session.id);
    session.messages = fullMessages;

    return NextResponse.json(session);

  } catch (error) {
    console.error("Interview Init Error:", error);
    return NextResponse.json(
      { error: "Failed to initialize interview", details: error.message },
      { status: 500 }
    );
  }
}
