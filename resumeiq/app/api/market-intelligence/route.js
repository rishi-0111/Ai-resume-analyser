import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMarketJobs } from "@/lib/services/jobsApi";
import { MARKET_ANALYSIS_SYSTEM_PROMPT } from "@/lib/services/ai/marketPrompts";
import { GoogleGenAI } from "@google/genai";
import { parseAIResponse } from "@/lib/services/ai/parser"; // Existing parser

export const maxDuration = 60; // 60 seconds timeout

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, jobTitle, location, jobDescription } = await request.json();
    
    if (!resumeId || !jobTitle) {
      return NextResponse.json({ error: "resumeId and jobTitle are required" }, { status: 400 });
    }

    // 2. Fetch the resume to get the raw text (already extracted by previous upload)
    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .select("raw_text")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (dbError || !resume || !resume.raw_text) {
      return NextResponse.json({ error: "Resume text not found. Ensure the resume is uploaded and parsed." }, { status: 404 });
    }

    // 3. Fetch Job Market Data
    console.log(`Fetching market data for: ${jobTitle} in ${location}`);
    const marketData = await fetchJobMarketData(jobTitle, location);

    // 4. Construct Gemini Prompt
    const prompt = `
Target Job Title: ${jobTitle}
Location: ${location || 'Any'}
Job Description (if any): ${jobDescription || 'N/A'}

--- RESUME TEXT START ---
${resume.raw_text}
--- RESUME TEXT END ---

--- LIVE JOB MARKET DATA START ---
${JSON.stringify(marketData, null, 2)}
--- LIVE JOB MARKET DATA END ---

Analyze the resume against the provided job market data and output the JSON report.
`;

    // 5. Call Gemini AI
    console.log("Calling Gemini for Market Intelligence...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: MARKET_ANALYSIS_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const aiReport = parseAIResponse(response.text);

    // 6. Save to database (career_reports table)
    const insertPayload = {
      user_id: user.id,
      resume_id: resumeId,
      job_title: jobTitle,
      location: location || '',
      job_description: jobDescription || '',
      market_data: marketData,
      ai_report: aiReport,
      status: 'completed'
    };

    const { data: reportData, error: insertError } = await supabase
      .from("career_reports")
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      console.error("DB Insert Error:", insertError);
      throw new Error("Failed to save career report to database.");
    }

    console.log("✓ Market Intelligence report generated and saved");
    return NextResponse.json({ success: true, data: reportData });

  } catch (error) {
    console.error("API /market-intelligence error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
