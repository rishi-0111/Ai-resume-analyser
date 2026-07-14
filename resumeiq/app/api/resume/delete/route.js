import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(request) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId } = await request.json();
    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
    }

    // 2. Fetch the resume to verify ownership and get file_path
    const { data: resume, error: fetchError } = await supabase
      .from("resumes")
      .select("id, file_path, user_id")
      .eq("id", resumeId)
      .eq("user_id", user.id) // Ensure user owns this resume
      .single();

    if (fetchError || !resume) {
      return NextResponse.json({ error: "Resume not found or access denied." }, { status: 404 });
    }

    // 3. Delete from Supabase Storage (best-effort — don't block if file is already gone)
    if (resume.file_path) {
      const { error: storageError } = await supabase.storage
        .from("resumes")
        .remove([resume.file_path]);

      if (storageError) {
        // Log but don't fail — file might already be gone
        console.warn("Storage delete warning:", storageError.message);
      } else {
        console.log("✓ File deleted from storage:", resume.file_path);
      }
    }

    // 4. Delete from DB (cascades to career_reports, interview_sessions via FK ON DELETE CASCADE)
    const { error: dbError } = await supabase
      .from("resumes")
      .delete()
      .eq("id", resumeId)
      .eq("user_id", user.id); // Double-check ownership

    if (dbError) {
      console.error("DB delete error:", dbError);
      return NextResponse.json({ error: "Failed to delete resume from database: " + dbError.message }, { status: 500 });
    }

    console.log("✓ Resume deleted:", resumeId);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("DELETE /api/resume error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
