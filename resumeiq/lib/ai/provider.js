import { GoogleGenAI } from "@google/genai";

/**
 * Reusable function to call the Gemini API with advanced error handling.
 * 
 * @param {Object} params
 * @param {string} params.systemPrompt - The system instructions for the AI.
 * @param {string} params.userPrompt - The user's input.
 * @param {number} [params.temperature=0.7] - The model temperature.
 * @param {number} [params.maxTokens=1024] - The maximum number of tokens to generate.
 * @param {string} [params.model="gemini-2.5-flash"] - The Gemini model to use.
 * @param {Array} [params.messages] - Optional array of message objects to support full chat history.
 * @param {boolean} [params.isJson=true] - Whether to parse the response as JSON.
 * @returns {Promise<any>} The parsed JSON response or raw string.
 */
export async function generateAIResponse({
  systemPrompt,
  userPrompt,
  messages,
  temperature = 0.7,
  maxTokens = 2048,
  model = "gemini-2.5-flash",
  isJson = true,
}) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[AI Provider] Generating response (Attempt ${attempt}/${MAX_RETRIES}) for model: ${model}`);
      
      let sysInstruction = systemPrompt;
      let contents = [];

      if (messages && messages.length > 0) {
        // Find system prompt in messages if it exists
        const sysMsg = messages.find(m => m.role === 'system');
        if (sysMsg) {
          sysInstruction = sysMsg.content;
        }

        // Map messages to Gemini format (user/model)
        contents = messages
          .filter(m => m.role !== 'system')
          .map(m => {
            let role = m.role === 'assistant' ? 'model' : m.role;
            // Fallback for roles like 'system' that slipped through
            if (role !== 'user' && role !== 'model') {
               role = 'user';
            }
            return {
              role: role,
              parts: [{ text: m.content || " " }]
            };
          });
      } else {
        contents = [{ role: "user", parts: [{ text: userPrompt || " " }] }];
      }

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: sysInstruction,
          responseMimeType: isJson ? "application/json" : "text/plain",
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const responseText = response.text || "";

      if (!isJson) {
        return responseText.trim();
      }

      // JSON Parsing Safeguards
      let jsonString = responseText;
      const firstBrace = jsonString.indexOf('{');
      const firstBracket = jsonString.indexOf('[');
      const lastBrace = jsonString.lastIndexOf('}');
      const lastBracket = jsonString.lastIndexOf(']');
      
      const firstObj = firstBrace !== -1 ? firstBrace : Infinity;
      const firstArr = firstBracket !== -1 ? firstBracket : Infinity;
      const firstIdx = Math.min(firstObj, firstArr);
      
      const lastObj = lastBrace !== -1 ? lastBrace : -1;
      const lastArr = lastBracket !== -1 ? lastBracket : -1;
      const lastIdx = Math.max(lastObj, lastArr);
      
      if (firstIdx !== Infinity && lastIdx !== -1 && firstIdx < lastIdx) {
        jsonString = jsonString.substring(firstIdx, lastIdx + 1);
      }

      try {
        const parsedJson = JSON.parse(jsonString);
        console.log(`[AI Provider] Successfully parsed JSON response.`);
        return parsedJson;
      } catch (parseError) {
        console.error(`[AI Provider] JSON Parsing Error:`, parseError);
        console.error(`[AI Provider] Raw response was:`, responseText);
        throw new Error("Failed to parse AI response into valid JSON.");
      }

    } catch (error) {
      console.error(`[AI Provider] Error on attempt ${attempt}:`, error.message);
      
      const isRateLimit = error.message?.includes('429');
      const isTransient = error.message?.includes('50') || error.message?.includes('timeout');

      if ((isRateLimit || isTransient) && attempt < MAX_RETRIES) {
        const delay = isRateLimit ? RETRY_DELAY_MS * attempt * 2 : RETRY_DELAY_MS;
        console.log(`[AI Provider] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      console.error(`[AI Provider] Max retries reached or non-retriable error.`);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }
}
