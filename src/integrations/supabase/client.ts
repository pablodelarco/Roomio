// StayWell Manager Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables with fallbacks for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://tddfubdbrmcteclrpnfv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZGZ1YmRicm1jdGVjbHJwbmZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDUzODAsImV4cCI6MjA3MDQyMTM4MH0.kHYNw-2PIi-Cg5eOxPYExb1CcnfcFoqOCGiMizCZJPY";

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing required Supabase environment variables. Please check your .env file.');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': `staywell-manager@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    },
  },
});