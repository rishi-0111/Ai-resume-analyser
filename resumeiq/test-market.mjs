import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load .env.local manually for this test script
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^#\s][^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  } catch (e) {
    console.warn("Could not load .env.local");
  }
}

loadEnv();

// --- 1. Mock Resume Text ---
const mockResume = `
John Doe
Software Engineer
Experience:
- Frontend Developer at Tech Startup (2021-Present): Built React applications, used Tailwind CSS, integrated REST APIs.
- Junior Web Developer at WebAgency (2019-2021): Wrote HTML, CSS, JavaScript.
Education: B.S. Computer Science
Skills: JavaScript, React, HTML, CSS, Git.
`;

// --- 2. Job API Fetcher (Replicated from jobsApi.js for testing) ---
async function fetchJobMarketData(jobTitle, location) {
  const apiKey = process.env.JOB_SEARCH_API_KEY;
  const query = encodeURIComponent(`${jobTitle} ${location}`.trim());
  
  if (!apiKey) {
    console.log("⚠️ No JOB_SEARCH_API_KEY found in .env.local. Using mock job data.");
    return [
      {
        job_title: "Senior React Developer",
        employer_name: "Innovate LLC",
        job_description: "Looking for an expert React developer. Must know Next.js, TypeScript, and state management (Redux/Zustand). Experience with testing (Jest) is required.",
        job_city: "New York",
        job_min_salary: 120000,
        job_max_salary: 160000
      },
      {
        job_title: "Frontend Engineer",
        employer_name: "Tech Corp",
        job_description: "Seeking a frontend engineer with strong JavaScript, React, and TypeScript skills. GraphQL experience is a plus.",
        job_city: "New York",
        job_min_salary: 110000,
        job_max_salary: 140000
      }
    ];
  }

  console.log("🌐 Fetching live jobs from JSearch API...");
  const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${query}&page=1&num_pages=1`, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  });

  if (!response.ok) throw new Error(`Job API Error: ${response.statusText}`);
  const result = await response.json();
  
  return (result.data || []).map(job => ({
    job_title: job.job_title,
    employer_name: job.employer_name,
    job_description: job.job_description,
    job_city: job.job_city,
    job_min_salary: job.job_min_salary,
    job_max_salary: job.job_max_salary
  }));
}

// --- 3. Gemini System Prompt (Replicated from marketPrompts.js) ---
const MARKET_ANALYSIS_SYSTEM_PROMPT = `You are an expert AI Career Coach and Job Market Analyst.
Your task is to analyze a user's resume against a specific target job title, location, and real-time market data (live job postings).

You will receive:
1. Target Job Title & Location
2. User's Resume Text
3. Live Job Market Data (JSON format containing recent job postings, descriptions, and salaries)

You must output a highly detailed JSON object matching this exact schema:

{
  "marketReadinessScore": number, 
  "atsScore": number, 
  "jobMatchScore": number, 
  "missingSkills": ["Skill 1", "Skill 2"], 
  "trendingSkills": ["Skill 1", "Skill 2"], 
  "hiringTrends": "A short 2-3 sentence summary...",
  "salaryInsights": { "min": number, "max": number, "median": number, "currency": "USD" },
  "learningRoadmap": [ { "topic": "Name", "actionableStep": "Step" } ],
  "aiSuggestions": ["Suggestion 1", "Suggestion 2"],
  "recommendedJobs": [ { "title": "Job Title", "employer": "Company Name", "link": "URL" } ]
}

IMPORTANT: ONLY output valid JSON. Do not include markdown formatting like \`\`\`json.`;

// --- 4. Main Test Execution ---
async function runTest() {
  const targetJob = "React Developer";
  const targetLocation = "New York";

  console.log(`\n--- Starting Market Intelligence Test ---`);
  console.log(`Target: ${targetJob} in ${targetLocation}\n`);

  try {
    const marketData = await fetchJobMarketData(targetJob, targetLocation);
    console.log(`✓ Fetched ${marketData.length} jobs.`);
    
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is missing from .env.local!");
      return;
    }

    console.log("🧠 Sending data to Gemini to extract trending skills...");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
Target Job Title: ${targetJob}
Location: ${targetLocation}

--- RESUME TEXT START ---
${mockResume}
--- RESUME TEXT END ---

--- LIVE JOB MARKET DATA START ---
${JSON.stringify(marketData, null, 2)}
--- LIVE JOB MARKET DATA END ---
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: MARKET_ANALYSIS_SYSTEM_PROMPT,
        temperature: 0.2,
      },
    });

    let jsonString = response.text;
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
    }

    const aiReport = JSON.parse(jsonString);
    console.log("\n✅ AI Processing Complete. Extracted Trending Skills & Data:");
    console.log("--------------------------------------------------");
    console.log(`Job Match Score: ${aiReport.jobMatchScore}/100`);
    console.log(`Trending Skills: ${aiReport.trendingSkills.join(", ")}`);
    console.log(`Missing Skills:  ${aiReport.missingSkills.join(", ")}`);
    console.log(`Salary Insights: $${aiReport.salaryInsights.min} - $${aiReport.salaryInsights.max}`);
    console.log(`Hiring Trends:   ${aiReport.hiringTrends}`);
    console.log("--------------------------------------------------\n");

  } catch (error) {
    console.error("❌ Test Failed:", error);
  }
}

runTest();
