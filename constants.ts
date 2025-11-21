
export const MAP_IMAGE_URL = "https://g.nexonstatic.com/media/afeezwjw/tallhartmap.png";

// Suggestion 4: Environment Variables
// We strictly read from Vite's import.meta.env.
// If these are missing in the .env file, the app will fail to connect (which is intended behavior for security).
export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

// Constants for Stale Data and Rate Limiting
export const STALE_DATA_THRESHOLD_MS = 60 * 60 * 1000; // 1 Hour
export const RATE_LIMIT_MS = 2000; // 2 seconds between updates per client
