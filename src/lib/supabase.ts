import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate URL structure to prevent Supabase SDK from throwing a fatal initialization exception
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Fall back to dummy placeholders when keys are not configured, avoiding startup crashes
const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-url.supabase.co';
const finalAnonKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(finalUrl, finalAnonKey);
