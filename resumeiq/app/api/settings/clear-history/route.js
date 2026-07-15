import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all resumes (this should cascade to analysis, depending on schema)
    const { error: resumeError } = await supabase
      .from('resumes')
      .delete()
      .eq('user_id', user.id);
      
    if (resumeError) {
        console.error("Resume deletion error:", resumeError);
    }

    // Delete all interviews
    const { error: interviewError } = await supabase
      .from('interview_sessions')
      .delete()
      .eq('user_id', user.id);
      
    if (interviewError) {
        console.error("Interview deletion error:", interviewError);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Clear history error:", error);
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}
