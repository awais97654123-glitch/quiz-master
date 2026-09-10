import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://heiirfzkjuwehszzgfsb.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "";

const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || "";

/**
 * Standard Supabase client for client-side and general public operations.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Privileged admin Supabase client using the service/secret key for backend API routes.
 * Never expose this client on the client-side.
 */
export const supabaseAdmin = supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;

/**
 * Health check to verify Supabase connectivity
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, message: "Connected to Supabase successfully" };
  } catch (err: any) {
    return { ok: false, message: err?.message || "Failed to reach Supabase" };
  }
}
