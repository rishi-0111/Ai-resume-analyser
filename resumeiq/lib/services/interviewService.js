import { supabase } from '../supabase/client';

export const interviewService = {
  /**
   * Fetches all interview sessions for the current user
   */
  async getSessions() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('interview_sessions')
      .select(`
        *,
        resumes ( file_name )
      `)
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetches a specific interview session
   */
  async getSessionById(id) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Creates a new pending interview session
   */
  async createSession({ resumeId, jobTitle, jobDescription, questions }) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: userData.user.id,
        resume_id: resumeId,
        job_title: jobTitle,
        job_description: jobDescription,
        questions: questions,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Updates an interview session with user answers and AI evaluation
   */
  async updateSession(id, { answers, scores, feedback, status }) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('interview_sessions')
      .update({
        answers,
        scores,
        feedback,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deletes an interview session
   */
  async deleteSession(id) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('interview_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user.id);

    if (error) throw error;
    return true;
  }
};
