// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// VITE automatically handles environment variables prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
//  console.log(supabaseUrl, supabaseAnonKey);
// Ensure these are set in your .env file
export const supabase = createClient(supabaseUrl, supabaseAnonKey);