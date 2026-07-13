import { supabase } from "@/lib/supabase/client";

/**
 * Profile Service — CRUD operations on the public.profiles table.
 */

/**
 * Fetch a user's profile by their auth user ID.
 * Returns null if the profile doesn't exist yet.
 * @param {string} userId
 * @returns {{ profile: object|null, error }}
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // PGRST116 = row not found — not a real error
  if (error && error.code === "PGRST116") {
    return { profile: null, error: null };
  }

  return { profile: data ?? null, error };
}

/**
 * Create or update a user's profile.
 * Safe to call multiple times — uses upsert.
 * @param {string} userId
 * @param {{ full_name?, role?, location?, plan?, avatar_url? }} updates
 * @returns {{ profile: object|null, error }}
 */
export async function upsertProfile(userId, updates = {}) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      { id: userId, ...updates, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    )
    .select()
    .single();

  return { profile: data ?? null, error };
}

/**
 * Update specific fields of an existing profile.
 * @param {string} userId
 * @param {object} updates
 * @returns {{ profile: object|null, error }}
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  return { profile: data ?? null, error };
}
