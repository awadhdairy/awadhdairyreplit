import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Session storage keys
export const SESSION_TOKEN_KEY = 'awadh_session_token';
export const USER_DATA_KEY = 'awadh_user_data';

// Helper to get stored session
export function getStoredSession(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

// Helper to store session
export function storeSession(token: string, userData: any) {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

// Helper to clear session
export function clearSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

// Helper to get stored user data
export function getStoredUser(): any | null {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}
