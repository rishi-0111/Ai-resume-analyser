import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all resumes
    const { data: resumes } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id);

    // Fetch all interview sessions
    const { data: interviews } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id);

    // Bundle data
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        exportedAt: new Date().toISOString()
      },
      resumes: resumes || [],
      interviews: interviews || []
    };

    // Return as a downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="resumeiq_data_${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
