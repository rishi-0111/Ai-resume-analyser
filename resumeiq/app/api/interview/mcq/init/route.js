import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { extractTextFromFile } from '@/lib/services/ai/extractor';
import { generateAIResponse } from '@/lib/ai/provider';
import { mcqGeneratorPrompt } from '@/lib/ai/prompts';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Verify User Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, jobTitle, domain, experienceLevel, difficulty, questionCount } = await request.json();

    if (!jobTitle) {
      return NextResponse.json({ error: "Missing required field: jobTitle" }, { status: 400 });
    }

    let resumeText = "";
    if (resumeId) {
      const { data: resume } = await supabase
        .from('resumes')
        .select('file_path')
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single();
      
      if (resume) {
        resumeText = await extractTextFromFile(resume.file_path);
      }
    }

    // 1. Build Context
    const count = questionCount || 10;
    let contextPrompt = `Target Job Title: ${jobTitle}\n`;
    if (domain) contextPrompt += `Target Technical Domain: ${domain}\n`;
    if (experienceLevel) contextPrompt += `Candidate Experience Level: ${experienceLevel}\n`;
    if (difficulty) contextPrompt += `Difficulty Level: ${difficulty}\n`;
    contextPrompt += `Total Questions to Generate: ${count}\n`;
    if (resumeText) contextPrompt += `\n--- CANDIDATE RESUME ---\n${resumeText}\n------------------------\n`;
    
    contextPrompt += `\nBased on the above context, generate exactly ${count} multiple-choice questions. They should cover topics, concepts, and algorithms relevant to the role. Ensure NO Markdown is wrapped around the JSON response, return pure JSON.`;

    // 2. Call NVIDIA NIM
    const aiResponseText = await generateAIResponse({
      messages: [
        { role: "system", content: mcqGeneratorPrompt },
        { role: "user", content: contextPrompt }
      ],
      temperature: 0.7
    });

    // 3. Parse JSON
    let generatedData;
    try {
      const startIndex = aiResponseText.indexOf('{');
      const endIndex = aiResponseText.lastIndexOf('}');
      
      if (startIndex !== -1 && endIndex !== -1) {
        const jsonStr = aiResponseText.substring(startIndex, endIndex + 1);
        generatedData = JSON.parse(jsonStr);
      } else {
        throw new Error("No JSON object found in response");
      }
    } catch (e) {
      console.error("Failed to parse MCQ JSON:", aiResponseText);
      return NextResponse.json({ error: "AI returned invalid JSON format." }, { status: 500 });
    }

    const questions = generatedData.questions || [];

    // 4. Save Session
    const { data: sessionData, error: insertError } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        resume_id: resumeId || null,
        job_title: jobTitle,
        job_description: `Domain: ${domain || 'N/A'}. Level: ${experienceLevel || 'N/A'}. Type: MCQ`,
        questions: questions,
        status: 'in_progress'
      })
      .select('id')
      .single();

    if (insertError) {
      console.error("DB Insert Error:", insertError);
      return NextResponse.json({ error: "Failed to initialize assessment session" }, { status: 500 });
    }

    return NextResponse.json({ 
      sessionId: sessionData.id,
      questions: questions
    });

  } catch (error) {
    console.error("MCQ Init API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
