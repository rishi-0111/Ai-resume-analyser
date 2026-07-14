import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { extractTextFromFile } from '@/lib/services/ai/extractor';
import { generateAIResponse } from '@/lib/ai/provider';
import { hrInterviewPrompt } from '@/lib/ai/prompts';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Verify User Authentication via cookie-based session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, jobTitle, jobDescription } = await request.json();

    if (!resumeId || !jobTitle) {
      return NextResponse.json({ error: "Missing required fields: resumeId and jobTitle" }, { status: 400 });
    }

    // 2. Fetch the resume — use stored raw_text or fallback extraction
    const { data: resume, error: dbError } = await supabase
      .from('resumes')
      .select('raw_text, file_path, file_name, analysis_data')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single();

    if (dbError || !resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    let resumeText = resume.raw_text;

    // Fallback: re-extract text from storage if raw_text is missing
    if (!resumeText || resumeText.trim().length < 50) {
      console.log("raw_text missing — re-extracting from storage for HR interview generation...");

      if (!resume.file_path) {
        return NextResponse.json({
          error: "Resume text unavailable. Please re-analyze your resume first."
        }, { status: 400 });
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("resumes")
        .download(resume.file_path);

      if (downloadError || !fileData) {
        return NextResponse.json({ error: "Failed to download resume from storage." }, { status: 500 });
      }

      try {
        const arrayBuffer = await fileData.arrayBuffer();
        const nodeBuffer = Buffer.from(arrayBuffer);
        resumeText = await extractTextFromFile(nodeBuffer, resume.file_name);
        resumeText = resumeText.replace(/\s+/g, ' ').trim();

        if (!resumeText || resumeText.length < 50) {
          throw new Error("Extracted resume text is too short or empty.");
        }

        // Save for future use
        await supabase.from("resumes").update({ raw_text: resumeText }).eq("id", resumeId);
        console.log("✓ Fallback extraction complete — raw_text saved.");
      } catch (extractionError) {
        console.error("Fallback extraction failed:", extractionError);
        return NextResponse.json({
          error: "Could not extract resume text. Please re-analyze your resume first."
        }, { status: 400 });
      }
    }

    // 3. Construct Prompt
    const userPrompt = `
Target Job Title: ${jobTitle}
Job Description: ${jobDescription || "Not provided (base questions on title and resume)"}

--- CANDIDATE RESUME ---
${resumeText}
------------------------
    `;

    // 4. Call NVIDIA NIM Provider
    const generatedData = await generateAIResponse({
      systemPrompt: hrInterviewPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    });

    if (!generatedData || !Array.isArray(generatedData.questions) || generatedData.questions.length === 0) {
      throw new Error("AI returned no questions. Please try again.");
    }

    // 5. Save to Database
    const { data: session, error: sessionDbError } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        resume_id: resumeId || null,
        job_title: jobTitle,
        job_description: jobDescription || '',
        questions: generatedData.questions,
        status: 'pending',
        type: 'hr' // Custom field to denote HR interview
      })
      .select()
      .single();

    if (sessionDbError) {
      console.error("Supabase Error:", sessionDbError);
      throw new Error("Failed to save session to database");
    }

    console.log("✓ HR Interview session created:", session.id);
    return NextResponse.json(session);

  } catch (error) {
    console.error("HR Interview Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview", details: error.message },
      { status: 500 }
    );
  }
}
