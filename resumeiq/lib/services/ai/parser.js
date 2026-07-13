/**
 * Safely parses the JSON output from Gemini and ensures all required fields exist.
 */
export function parseAIResponse(responseText) {
  try {
    // Clean up potential markdown formatting block if Gemini wraps it
    const cleanText = responseText
      .replace(/^```json/i, "")
      .replace(/```$/i, "")
      .trim();
      
    const data = JSON.parse(cleanText);

    // Provide safe defaults for all fields expected by the UI
    return {
      overallScore: typeof data.overallScore === "number" ? data.overallScore : 0,
      atsScore: typeof data.atsScore === "number" ? data.atsScore : 0,
      jobMatch: typeof data.jobMatch === "number" ? data.jobMatch : 0,
      resumeHealth: typeof data.resumeHealth === "number" ? data.resumeHealth : 0,
      
      sectionScores: Array.isArray(data.sectionScores) ? data.sectionScores : [],
      radarData: Array.isArray(data.radarData) ? data.radarData : [],
      barData: Array.isArray(data.barData) ? data.barData : [],
      
      summary: typeof data.summary === "string" ? data.summary : "No summary generated.",
      careerLevel: typeof data.careerLevel === "string" ? data.careerLevel : "Not specified",

      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
      grammarIssues: Array.isArray(data.grammarIssues) ? data.grammarIssues : [],
      keywordSuggestions: Array.isArray(data.keywordSuggestions) ? data.keywordSuggestions : [],
      missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills : [],
      recommendedSkills: Array.isArray(data.recommendedSkills) ? data.recommendedSkills : [],
      recommendedJobRoles: Array.isArray(data.recommendedJobRoles) ? data.recommendedJobRoles : [],
      
      suggestedProjects: Array.isArray(data.suggestedProjects) ? data.suggestedProjects : [],
      aiSuggestions: Array.isArray(data.aiSuggestions) ? data.aiSuggestions : [],
      interviewQuestions: Array.isArray(data.interviewQuestions) ? data.interviewQuestions : [],
      coverLetter: typeof data.coverLetter === "string" ? data.coverLetter : "Cover letter generation failed. Please re-analyze.",
    };
  } catch (error) {
    console.error("Failed to parse AI JSON response:", error);
    console.error("Raw response:", responseText);
    throw new Error("Invalid AI response format.");
  }
}
