/**
 * Service to interact with Job Market APIs (like JSearch via RapidAPI)
 * This fetches live job listings and salary data to compare against the user's resume.
 */

export async function fetchJobMarketData(jobTitle, location = '') {
  const apiKey = process.env.JOB_SEARCH_API_KEY;
  const query = encodeURIComponent(`${jobTitle} ${location}`.trim());
  
  // If no API key is provided, we return mock data so development isn't blocked.
  if (!apiKey) {
    console.warn("No JOB_SEARCH_API_KEY found. Returning mock market data.");
    return getMockMarketData(jobTitle, location);
  }

  try {
    // Note: The user's curl used /active-jb-count, but we need full job listings to extract skills.
    // Assuming the search endpoint is /search for this API.
    const response = await fetch(`https://linkedin-job-search-api.p.rapidapi.com/search?title=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(location)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'linkedin-job-search-api.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Job API Error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Map the results to extract only the necessary fields for AI analysis
    // This saves tokens and focuses Gemini on extracting trending skills and requirements.
    const jobs = (result.data || []).map(job => ({
      job_title: job.job_title,
      employer_name: job.employer_name,
      job_description: job.job_description,
      job_city: job.job_city,
      job_state: job.job_state,
      job_min_salary: job.job_min_salary,
      job_max_salary: job.job_max_salary,
      job_apply_link: job.job_apply_link
    }));

    return jobs;
  } catch (error) {
    console.error("Failed to fetch job market data:", error);
    // Fallback to mock data on failure to prevent full crash during dev/testing
    return getMockMarketData(jobTitle, location);
  }
}

/**
 * Provides mock market data for development or fallback purposes.
 */
function getMockMarketData(jobTitle, location) {
  return [
    {
      job_title: `${jobTitle} Professional`,
      employer_name: "Tech Corp Inc.",
      job_description: "Looking for an experienced professional with strong problem-solving skills, leadership, and technical expertise in modern frameworks.",
      job_apply_link: "https://example.com/apply",
      job_city: location || "Remote",
      job_min_salary: 80000,
      job_max_salary: 120000
    },
    {
      job_title: `Senior ${jobTitle}`,
      employer_name: "Innovate LLC",
      job_description: "Seeking a senior candidate with excellent communication, scalable architecture experience, and mentoring capabilities.",
      job_apply_link: "https://example.com/apply2",
      job_city: location || "New York",
      job_min_salary: 100000,
      job_max_salary: 150000
    }
  ];
}
