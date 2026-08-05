const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export async function readSupabaseTable<T>(table: string): Promise<T[]> {
  if (!supabaseUrl || !supabaseKey) return [];

  const response = await fetch(`${supabaseUrl}/rest/v1/${encodeURIComponent(table)}?select=*`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) throw new Error(`Supabase request failed (${response.status})`);
  return response.json() as Promise<T[]>;
}
