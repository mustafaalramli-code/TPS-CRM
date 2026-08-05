// The deployed application uses Supabase through app/supabase.ts.
// This module remains as a compatibility boundary for future server-side queries.
export { isSupabaseConfigured, readSupabaseTable } from "../app/supabase";
