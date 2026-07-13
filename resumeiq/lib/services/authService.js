import { supabase } from "@/lib/supabase/client";

/**
 * Auth Service — all Supabase authentication operations.
 * Used by login/signup/forgot-password pages.
 */

/**
 * Sign in an existing user with email + password.
 * @returns {{ data, error }}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

/**
 * Register a new user with email, password, and full name.
 * The full_name is stored in user_metadata and also written to profiles
 * via the database trigger (handle_new_user).
 * @returns {{ data, error }}
 */
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  return { data, error };
}

/**
 * Sign in via Google OAuth — redirects to Google consent screen.
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  return { data, error };
}

/**
 * Send a password reset email.
 * @returns {{ data, error }}
 */
export async function sendPasswordReset(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { data, error };
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the currently logged-in user (client-side).
 * @returns {{ user, error }}
 */
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}
