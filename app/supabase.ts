import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export async function readSupabaseTable<T = Record<string, unknown>>(table: string): Promise<T[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as T[];
}

export async function upsertSupabaseRow(table: string, row: Record<string, unknown>, conflictColumn: string) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.from(table).upsert(row, { onConflict: conflictColumn }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSupabaseRow(table: string, column: string, value: string) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from(table).delete().eq(column, value);
  if (error) throw error;
}

export async function insertSupabaseRow(table: string, row: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) throw error;
  return data;
}
