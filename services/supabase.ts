import 'react-native-url-polyfill/dist/URLSearchParams';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// ──────────────────────────────────────────────
// SET THESE after creating your Supabase project
// at https://supabase.com/dashboard
// ──────────────────────────────────────────────
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
