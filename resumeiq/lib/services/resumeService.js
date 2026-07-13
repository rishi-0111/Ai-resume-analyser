import { supabase } from "@/lib/supabase/client";

const BUCKET = "resumes";
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Resume Service — upload to Storage + CRUD on public.resumes table.
 */

/**
 * Validate a file before uploading.
 * @param {File} file
 * @returns {{ valid: boolean, error: string }}
 */
export function validateResumeFile(file) {
  if (file.size === 0) {
    return { valid: false, error: "The selected file is empty." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Only PDF and DOCX files are supported." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: "File size must be under 10MB." };
  }
  return { valid: true, error: "" };
}

/**
 * Upload a resume file to Supabase Storage and save metadata to the DB.
 * Files are stored under: resumes/{userId}/{timestamp}-{filename}
 *
 * @param {string} userId
 * @param {File} file
 * @param {{ jobTitle?: string, company?: string, jobDescription?: string }} meta
 * @param {(progress: number) => void} onProgress - callback with % 0–100
 * @returns {{ resume: object|null, error: string|null }}
 */
export async function uploadResume(userId, file, meta = {}, onProgress) {
  // 1. Validate
  const { valid, error: validationError } = validateResumeFile(file);
  if (!valid) return { resume: null, error: validationError };

  // 1.5 Check for duplicates (same filename within the last 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: duplicates } = await supabase
    .from("resumes")
    .select("id")
    .eq("user_id", userId)
    .eq("file_name", file.name)
    .gte("uploaded_at", oneHourAgo);

  if (duplicates && duplicates.length > 0) {
    return { resume: null, error: "Duplicate upload detected. You uploaded this file recently." };
  }

  // 2. Build unique storage path: userId/timestamp-filename
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${userId}/${timestamp}-${safeName}`;

  // 3. Simulate progress start
  onProgress?.(10);

  // 4. Upload to Supabase Storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (storageError) {
    return { resume: null, error: storageError.message };
  }

  onProgress?.(70);

  // 5. Save metadata to resumes table
  const { data, error: dbError } = await supabase
    .from("resumes")
    .insert({
      user_id: userId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      job_title: meta.jobTitle ?? "",
      company: meta.company ?? "",
      job_description: meta.jobDescription ?? "",
      status: "uploaded",
      uploaded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (dbError) {
    // Attempt cleanup of orphaned storage file
    await supabase.storage.from(BUCKET).remove([filePath]);
    return { resume: null, error: dbError.message };
  }

  onProgress?.(100);
  return { resume: data, error: null };
}

/**
 * Fetch all resumes for a user, ordered by newest first.
 * @param {string} userId
 * @returns {{ resumes: Array, error }}
 */
export async function getResumes(userId) {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false });

  return { resumes: data ?? [], error };
}

/**
 * Fetch aggregated stats for a user's resumes.
 * @param {string} userId
 * @returns {{ stats: { total, bestAts, avgAts, latestAts, trend, latestResume, recentUploads }, error }}
 */
export async function getResumeStats(userId) {
  const { resumes, error } = await getResumes(userId);

  if (error) return { stats: null, error };

  const completed = resumes.filter((r) => r.ats_score !== null && r.ats_score !== undefined);
  const scores = completed.map((r) => r.ats_score);

  const bestAts = scores.length ? Math.max(...scores) : null;
  const avgAts = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;
  const latestAts = completed.length ? completed[0].ats_score : null;

  // Calculate improvement trend: (latest - avg)
  let trend = null;
  if (latestAts !== null && avgAts !== null && scores.length > 1) {
    trend = latestAts - avgAts;
  }

  const stats = {
    total: resumes.length,
    bestAts,
    avgAts,
    latestAts,
    trend,
    latestResume: resumes[0] ?? null,
    recentUploads: resumes.slice(0, 5),
  };

  return { stats, error: null };
}

/**
 * Delete a resume from Storage and the DB.
 * @param {string} resumeId
 * @param {string} filePath
 * @returns {object} { error }
 */
export async function deleteResume(resumeId, filePath) {
  // 1. Delete from storage
  if (filePath) {
    await supabase.storage.from(BUCKET).remove([filePath]);
  }

  // 2. Delete from DB
  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId);

  return { error: storageError?.message ?? null };
}

/**
 * Get a signed URL for viewing a stored resume file.
 * @param {string} filePath
 * @returns {{ url: string|null, error }}
 */
export async function getResumeUrl(filePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  return { url: data?.signedUrl ?? null, error };
}

/**
 * Fetches a specific resume by ID including analysis data.
 * @param {string} resumeId 
 * @returns {Promise<{resume: object|null, error: string|null}>}
 */
export async function getResumeById(resumeId) {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .single();

  return { resume: data, error: error?.message || null };
}
