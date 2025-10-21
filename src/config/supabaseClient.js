import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if environment variables are properly configured
export const isSupabaseConfigured = Boolean(
  process.env.REACT_APP_SUPABASE_URL && 
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Log warning if not configured
if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase is not configured. Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env file.\n' +
    'The app will work without authentication, but the login and protected routes will not function.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: window.localStorage
  }
});

