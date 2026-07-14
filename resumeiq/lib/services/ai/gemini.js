import { GoogleGenAI } from "@google/genai";
import { ANALYSIS_SYSTEM_PROMPT } from "./prompts";
import { parseAIResponse } from "./parser";

// Initialize the Gemini client using the API key from environment variables
// Note: We use the server-side env variable here. This file should only be used in Server Contexts (like Route Handlers)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyzes a resume file using Gemini.
 * @param {string} resumeText - The extracted raw text of the resume.
 * @param {object} meta - Optional context (jobTitle, company, etc.)
 */
export async function analyzeResumeWithGemini(resumeText, meta = {}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const prompt = `Please analyze the following resume text. 
Target Job Title: ${meta.jobTitle || 'General/Unknown'}
Target Company: ${meta.company || 'Unknown'}
Job Description: ${meta.jobDescription || 'None provided'}

--- RESUME TEXT START ---
${resumeText}
--- RESUME TEXT END ---

Provide a highly detailed analysis following the system instructions exactly.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Fast, accurate model
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
          ],
        },
      ],
      config: {
        systemInstruction: ANALYSIS_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.2, // Low temp for more consistent/factual analysis
      },
    });

    return parseAIResponse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to analyze resume with AI.");
  }
}
