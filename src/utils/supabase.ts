import { createClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://pacoywekwvdmhvtndqra.supabase.co";
const DEFAULT_KEY = "sb_publishable_SeP0MxYk7Gk_h93a_nAFxg_fXXVQdnZ";

const supabaseUrl = DEFAULT_URL;
const supabaseAnonKey = DEFAULT_KEY;

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey);

// Polyfill WebSocket on server-side Node.js environment to prevent Realtime constructor checks from throwing errors
if (typeof window === "undefined") {
  class DummyWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    onclose = () => {};
    onerror = () => {};
    onmessage = () => {};
    onopen = () => {};
    close = () => {};
    send = () => {};
  }
  if (!(globalThis as any).WebSocket) {
    (globalThis as any).WebSocket = DummyWebSocket;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
