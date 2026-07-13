import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase/client';
import { INTERVIEW_GENERATOR_PROMPT } from '@/lib/services/ai/interviewPrompts';

export async function POST(request) {
  try {
    const { resumeText, jobTitle, jobDescription, resumeId } = await request.json();

    if (!resumeText || !jobTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify User Authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Setup Gemini AI
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 3. Construct Prompt
    const userPrompt = `
Target Job Title: ${jobTitle}
Job Description: ${jobDescription || "Not provided (base questions on title and resume)"}

--- CANDIDATE RESUME ---
${resumeText}
------------------------
    `;

    // 4. Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: INTERVIEW_GENERATOR_PROMPT,
        temperature: 0.7, // Higher temp for more creative/varied questions
      },
    });

    // 5. Parse JSON Response
    let jsonString = response.text;
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    
    let generatedData;
    try {
      generatedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Gemini returned invalid JSON:", jsonString);
      throw new Error("Failed to parse AI response");
    }

    // 6. Save to Database
    const { data: session, error: dbError } = await supabase
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

    if (dbError) {
      console.error("Supabase Error:", dbError);
      throw new Error("Failed to save session to database");
    }

    // 7. Return the new session
    return NextResponse.json(session);

  } catch (error) {
    console.error("Interview Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview", details: error.message },
      { status: 500 }
    );
  }
}
