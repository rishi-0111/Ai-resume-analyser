import OpenAI from "openai";

/**
 * Configure the OpenAI SDK client to use the NVIDIA NIM API.
 * The NVIDIA NIM API is fully OpenAI-compatible.
 */

if (!process.env.NVIDIA_API_KEY) {
  console.warn("WARNING: NVIDIA_API_KEY is not set in environment variables.");
}

const nvidiaClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || "dummy-key-for-build",
  baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
});

export default nvidiaClient;
