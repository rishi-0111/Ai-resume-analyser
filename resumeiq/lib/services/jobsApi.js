/**
 * RapidAPI JSearch Service (Live Data Only)
 * 
 * Fetches real job postings from Google Jobs via JSearch API.
 * Uses an in-memory cache to prevent duplicate rapidAPI charges for identical searches.
 */

// Simple In-Memory Cache: { "JobTitle_Location": { timestamp, data } }
const searchCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetches live job data based on a title and location.
 * 
 * @param {string} jobTitle 
 * @param {string} location 
 * @returns {Promise<Array>} Array of mapped job objects
 */
export async function fetchMarketJobs(jobTitle, location = "") {
  const apiKey = process.env.JOB_SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error("JOB_SEARCH_API_KEY is missing from environment variables.");
  }

  const query = encodeURIComponent(`${jobTitle} ${location}`.trim());
  const cacheKey = query.toLowerCase();

  // 1. Check Cache
  if (searchCache.has(cacheKey)) {
    const cachedEntry = searchCache.get(cacheKey);
    if (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      console.log(`[Cache Hit] Returning cached market data for: "${jobTitle} ${location}"`);
      return cachedEntry.data;
    } else {
      searchCache.delete(cacheKey); // Evict stale cache
    }
  }

  console.log(`[API Call] Fetching live JSearch data for: "${jobTitle} ${location}"`);

  // 2. Fetch Live JSearch Data
  try {
    const response = await fetch(`https://jsearch.p.rapidapi.com/search-v2?query=${query}&page=1&num_pages=1`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`RapidAPI Error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data.jobs)) {
      throw new Error("Invalid response format from JSearch API.");
    }

    // 3. Map the response to save tokens for Gemini
    // We strictly extract only what AI needs to save token bandwidth
    const mappedJobs = data.data.jobs.map(job => ({
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city ? `${job.job_city}, ${job.job_state || ''}` : "Remote/Unknown",
      description: job.job_description,
      salary_range: (job.job_min_salary && job.job_max_salary) 
        ? `$${job.job_min_salary} - $${job.job_max_salary}`
        : "Not Specified",
      apply_link: job.job_apply_link
    })).filter(job => job.description); // Ensure we only keep jobs with descriptions

    if (mappedJobs.length === 0) {
      throw new Error("No valid jobs with descriptions found for this search.");
    }

    // Cap at top 5 jobs to keep AI prompt within context limits
    const topJobs = mappedJobs.slice(0, 5);

    // 4. Update Cache
    searchCache.set(cacheKey, {
      timestamp: Date.now(),
      data: topJobs
    });

    return topJobs;

  } catch (error) {
    console.error("Error fetching market jobs:", error);
    throw error; // Bubble up so the API route fails cleanly
  }
}
