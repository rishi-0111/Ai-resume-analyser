import nvidiaClient from "./nvidia";

/**
 * Reusable function to call the NVIDIA NIM API with advanced error handling.
 * 
 * @param {Object} params
 * @param {string} params.systemPrompt - The system instructions for the AI.
 * @param {string} params.userPrompt - The user's input.
 * @param {number} [params.temperature=0.7] - The model temperature.
 * @param {number} [params.maxTokens=1024] - The maximum number of tokens to generate.
 * @param {string} [params.model="meta/llama-3.1-70b-instruct"] - The NIM model to use.
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
  model = "meta/llama-3.1-70b-instruct", // A solid default model available on NVIDIA NIM
  isJson = true,
}) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000;
  const TIMEOUT_MS = 60000; // 60 seconds

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[AI Provider] Generating response (Attempt ${attempt}/${MAX_RETRIES}) for model: ${model}`);
      
      // Implement timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      // Determine messages array
      const apiMessages = messages || [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];

      const response = await nvidiaClient.chat.completions.create({
        model,
        messages: apiMessages,
        temperature,
        max_tokens: maxTokens,
      }, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseText = response.choices[0]?.message?.content || "";

      if (!isJson) {
        return responseText.trim();
      }

      // JSON Parsing Safeguards
      let jsonString = responseText
        .replace(/^```json\s*/i, '') // Remove markdown json tags if present
        .replace(/```\s*$/i, '')
        .trim();

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
      
      const isRateLimit = error.status === 429;
      const isTimeout = error.name === 'AbortError';
      const isTransient = error.status >= 500;

      if ((isRateLimit || isTransient || isTimeout) && attempt < MAX_RETRIES) {
        const delay = isRateLimit ? RETRY_DELAY_MS * attempt * 2 : RETRY_DELAY_MS; // Exponential backoff for rate limits
        console.log(`[AI Provider] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      console.error(`[AI Provider] Max retries reached or non-retriable error.`);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }
}
