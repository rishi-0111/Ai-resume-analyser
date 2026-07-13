import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeResumeWithGemini } from "@/lib/services/ai/gemini";
import { extractTextFromFile } from "@/lib/services/ai/extractor";

// Disable default body parser max duration if needed, though default usually works for basic AI calls
export const maxDuration = 60; // 60 seconds timeout for Vercel

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, force } = await request.json();
    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
    }

    // 2. Fetch the resume metadata from public.resumes
    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (dbError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Return cached result if already completed and NOT forcing a re-run
    if (!force && resume.status === "completed" && resume.analysis_data) {
      return NextResponse.json({ success: true, message: "Already analyzed", data: resume.analysis_data });
    }

    // Mark status as analyzing
    await supabase.from("resumes").update({ status: "analyzing" }).eq("id", resumeId);

    // 3. Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(resume.file_path);

    if (downloadError || !fileData) {
      await supabase.from("resumes").update({ status: "error" }).eq("id", resumeId);
      return NextResponse.json({ error: "Failed to download file from storage" }, { status: 500 });
    }
    console.log(`✓ File downloaded (${resumeId})`);

    // 4. Extract text from PDF/DOCX
    let resumeText = "";
    try {
      const arrayBuffer = await fileData.arrayBuffer();
      const nodeBuffer = Buffer.from(arrayBuffer);
      resumeText = await extractTextFromFile(nodeBuffer, resume.file_name);
      
      // Clean extracted text (remove excessive newlines/spaces)
      resumeText = resumeText.replace(/\s+/g, ' ').trim();
      
      if (!resumeText || resumeText.length < 50) {
        throw new Error("Extracted text is empty or too short. File may be corrupted or an image-based PDF.");
      }
      console.log("✓ PDF/DOCX text extracted and cleaned");
    } catch (extractionError) {
      console.error("Text extraction failed:", extractionError);
      await supabase.from("resumes").update({ status: "error" }).eq("id", resumeId);
      return NextResponse.json({ 
        error: extractionError.message || "Unable to extract text from this resume. Please upload a text-based PDF or DOCX." 
      }, { status: 400 });
    }

    // 5. Call Gemini AI with 1-retry loop
    console.log("✓ Gemini request sent");
    let analysisData = null;
    let retries = 1;
    while (retries >= 0) {
      try {
        analysisData = await analyzeResumeWithGemini(resumeText, {
          jobTitle: resume.job_title,
          company: resume.company,
          jobDescription: resume.job_description
        });
        console.log("✓ Gemini response received");
        break; // Success
      } catch (geminiError) {
        console.error(`Gemini analysis failed. Retries left: ${retries}`, geminiError);
        if (retries === 0) throw geminiError;
        retries--;
      }
    }

    // Extract top-level scores for DB columns
    const updatePayload = {
      status: "completed",
      analysis_data: analysisData,
      overall_score: analysisData.overallScore,
      ats_score: analysisData.atsScore,
      job_match: analysisData.jobMatch || 0
    };

    // 6. Save results to DB
    const { error: updateError } = await supabase
      .from("resumes")
      .update(updatePayload)
      .eq("id", resumeId);

    if (updateError) {
      throw updateError;
    }
    console.log("✓ Analysis saved");

    return NextResponse.json({ success: true, data: analysisData });
    
  } catch (error) {
    console.error("API /analyze error:", error);
    // Attempt to mark as error if we have a resumeId context
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
