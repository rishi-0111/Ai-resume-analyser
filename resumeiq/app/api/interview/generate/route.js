import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { INTERVIEW_GENERATOR_PROMPT } from '@/lib/services/ai/interviewPrompts';
import { extractTextFromFile } from '@/lib/services/ai/extractor';

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
      console.log("raw_text missing — re-extracting from storage for interview generation...");

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

    // 3. Setup Gemini AI
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 4. Construct Prompt
    const userPrompt = `
Target Job Title: ${jobTitle}
Job Description: ${jobDescription || "Not provided (base questions on title and resume)"}

--- CANDIDATE RESUME ---
${resumeText}
------------------------
    `;

    // 5. Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: INTERVIEW_GENERATOR_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    // 6. Parse JSON Response
    let jsonString = response.text
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let generatedData;
    try {
      generatedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Gemini returned invalid JSON:", jsonString);
      throw new Error("Failed to parse AI response");
    }

    if (!Array.isArray(generatedData.questions) || generatedData.questions.length === 0) {
      throw new Error("AI returned no questions. Please try again.");
    }

    // 7. Save to Database
    const { data: session, error: sessionDbError } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        resume_id: resumeId || null,
        job_title: jobTitle,
        job_description: jobDescription || '',
        questions: generatedData.questions,
        status: 'pending'
      })
      .select()
      .single();

    if (sessionDbError) {
      console.error("Supabase Error:", sessionDbError);
      throw new Error("Failed to save session to database");
    }

    console.log("✓ Interview session created:", session.id);
    return NextResponse.json(session);

  } catch (error) {
    console.error("Interview Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview", details: error.message },
      { status: 500 }
    );
  }
}
