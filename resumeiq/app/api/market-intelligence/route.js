import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMarketJobs } from "@/lib/services/jobsApi";
import { MARKET_ANALYSIS_SYSTEM_PROMPT } from "@/lib/services/ai/marketPrompts";
import { GoogleGenAI } from "@google/genai";
import { extractTextFromFile } from "@/lib/services/ai/extractor";

export const maxDuration = 60; // 60 seconds timeout

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Safely parses the market AI JSON response with fallback defaults.
 */
function parseMarketAIResponse(responseText) {
  try {
    const cleanText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const data = JSON.parse(cleanText);
    return {
      marketReadinessScore: typeof data.marketReadinessScore === "number" ? data.marketReadinessScore : 0,
      atsScore: typeof data.atsScore === "number" ? data.atsScore : 0,
      jobMatchScore: typeof data.jobMatchScore === "number" ? data.jobMatchScore : 0,
      missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills : [],
      trendingSkills: Array.isArray(data.trendingSkills) ? data.trendingSkills : [],
      hiringTrends: typeof data.hiringTrends === "string" ? data.hiringTrends : "No trends data available.",
      salaryInsights: {
        min: typeof data.salaryInsights?.min === "number" ? data.salaryInsights.min : 0,
        max: typeof data.salaryInsights?.max === "number" ? data.salaryInsights.max : 0,
        median: typeof data.salaryInsights?.median === "number" ? data.salaryInsights.median : 0,
        currency: data.salaryInsights?.currency || "USD",
      },
      learningRoadmap: Array.isArray(data.learningRoadmap) ? data.learningRoadmap : [],
      aiSuggestions: Array.isArray(data.aiSuggestions) ? data.aiSuggestions : [],
      recommendedJobs: Array.isArray(data.recommendedJobs) ? data.recommendedJobs : [],
    };
  } catch (error) {
    console.error("Failed to parse Market AI JSON response:", error);
    console.error("Raw response:", responseText);
    throw new Error("Invalid AI response format from market analysis.");
  }
}

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

    // 2. Fetch the resume (raw_text + file_path for fallback extraction)
    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .select("raw_text, file_path, file_name, analysis_data")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (dbError || !resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // Get the resume text — use stored raw_text, or fallback to re-extraction from storage
    let resumeText = resume.raw_text;

    if (!resumeText || resumeText.trim().length < 50) {
      console.log("raw_text missing — re-extracting from storage...");
      
      if (!resume.file_path) {
        return NextResponse.json({ 
          error: "Resume text not available. Please re-analyze your resume first before running market intelligence." 
        }, { status: 400 });
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("resumes")
        .download(resume.file_path);

      if (downloadError || !fileData) {
        return NextResponse.json({ error: "Failed to download resume file from storage." }, { status: 500 });
      }

      try {
        const arrayBuffer = await fileData.arrayBuffer();
        const nodeBuffer = Buffer.from(arrayBuffer);
        resumeText = await extractTextFromFile(nodeBuffer, resume.file_name);
        resumeText = resumeText.replace(/\s+/g, " ").trim();

        if (!resumeText || resumeText.length < 50) {
          throw new Error("Extracted resume text is too short or empty.");
        }

        // Save raw_text for future use
        await supabase.from("resumes").update({ raw_text: resumeText }).eq("id", resumeId);
        console.log("✓ Fallback extraction complete — raw_text saved.");
      } catch (extractionError) {
        console.error("Fallback extraction failed:", extractionError);
        return NextResponse.json({ 
          error: "Could not extract text from your resume. Please re-analyze it first." 
        }, { status: 400 });
      }
    }

    // 3. Fetch Job Market Data
    console.log(`Fetching market data for: ${jobTitle} in ${location || "any"}`);
    let marketData = [];
    try {
      marketData = await fetchMarketJobs(jobTitle, location);
    } catch (jobsError) {
      console.warn("Job market fetch failed, proceeding with empty data:", jobsError.message);
      // Don't block — AI will still generate a useful report without live jobs
    }

    // 4. Construct Gemini Prompt
    const prompt = `
Target Job Title: ${jobTitle}
Location: ${location || "Any"}
Job Description (if any): ${jobDescription || "N/A"}

--- RESUME TEXT START ---
${resumeText}
--- RESUME TEXT END ---

--- LIVE JOB MARKET DATA START ---
${marketData.length > 0 ? JSON.stringify(marketData, null, 2) : "No live job data available. Use your training knowledge to infer market trends for this role."}
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

    const aiReport = parseMarketAIResponse(response.text);

    // 6. Save to database (career_reports table)
    const insertPayload = {
      user_id: user.id,
      resume_id: resumeId,
      job_title: jobTitle,
      location: location || "",
      job_description: jobDescription || "",
      market_data: marketData,
      ai_report: aiReport,
      status: "completed",
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
