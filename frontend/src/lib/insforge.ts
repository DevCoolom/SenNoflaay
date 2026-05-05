import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Compatibility shim — keeps all existing insforge.database.from() and insforge.storage.from() calls working
export const insforge = {
  database: supabase,
  storage: supabase.storage,
};
