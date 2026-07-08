import { createClient } from '@supabase/supabase-js';

// Fungsi untuk mendapatkan konfigurasi Supabase secara dinamis (dari Env atau LocalStorage)
export function getSupabaseConfig() {
  if (typeof window === 'undefined') {
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    };
  }

  // Cek apakah ada kredensial kustom yang dimasukkan user lewat UI
  const customUrl = localStorage.getItem('sch_supabase_url');
  const customKey = localStorage.getItem('sch_supabase_anon_key');

  return {
    supabaseUrl: customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: customKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  };
}

// Fungsi untuk menyimpan kredensial Supabase kustom ke localStorage
export function saveSupabaseConfig(url: string, key: string) {
  if (typeof window === 'undefined') return;
  if (!url || !key) {
    localStorage.removeItem('sch_supabase_url');
    localStorage.removeItem('sch_supabase_anon_key');
    localStorage.removeItem('sch_supabase_connected');
  } else {
    localStorage.setItem('sch_supabase_url', url.trim());
    localStorage.setItem('sch_supabase_anon_key', key.trim());
    localStorage.setItem('sch_supabase_connected', 'true');
  }
}

// Global variable to cache the Supabase client instance
let cachedSupabaseClient: any = null;
let cachedSupabaseUrl = '';
let cachedSupabaseKey = '';

// Fungsi untuk mendapatkan instance client Supabase secara aman
export function getSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseAnonKey) {
    cachedSupabaseClient = null;
    return null;
  }
  
  if (!cachedSupabaseClient || cachedSupabaseUrl !== supabaseUrl || cachedSupabaseKey !== supabaseAnonKey) {
    try {
      cachedSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      cachedSupabaseUrl = supabaseUrl;
      cachedSupabaseKey = supabaseAnonKey;
    } catch (error) {
      console.error('Gagal membuat client Supabase:', error);
      return null;
    }
  }
  return cachedSupabaseClient;
}

/**
 * Dapatkan user authenticated dari Supabase dengan batas waktu (timeout).
 * Jika pemanggilan menggantung (stuck) atau terjadi error sesi kritis,
 * secara otomatis bersihkan cache sesi Supabase agar sistem pulih secara instan tanpa perlu hapus cache browser manual.
 */
export async function getAuthenticatedUserWithTimeout(timeoutMs = 8000): Promise<any> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const timeoutPromise = new Promise<null>((_, reject) => {
    setTimeout(() => {
      reject(new Error('TIMEOUT_AUTH_CHECK'));
    }, timeoutMs);
  });

  try {
    const userPromise = (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    })();

    const user = await Promise.race([userPromise, timeoutPromise]);
    return user;
  } catch (error: any) {
    console.error('Pemeriksaan user otentikasi Supabase gagal atau stuck:', error);
    handleCorruptedSession(error);
    throw error;
  }
}

/**
 * Dapatkan session aktif dari Supabase dengan batas waktu (timeout).
 * Berguna untuk inisialisasi aplikasi awal agar halaman tidak stuck ketika token kedaluwarsa/korup.
 */
export async function getAuthenticatedSessionWithTimeout(timeoutMs = 8000): Promise<any> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const timeoutPromise = new Promise<null>((_, reject) => {
    setTimeout(() => {
      reject(new Error('TIMEOUT_SESSION_CHECK'));
    }, timeoutMs);
  });

  try {
    const sessionPromise = (async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    })();

    const session = await Promise.race([sessionPromise, timeoutPromise]);
    return session;
  } catch (error: any) {
    console.error('Pemeriksaan session Supabase gagal atau stuck:', error);
    handleCorruptedSession(error);
    throw error;
  }
}

/**
 * Fungsi utilitas untuk membersihkan localStorage dari token Supabase yang rusak secara otomatis
 */
function handleCorruptedSession(error: any) {
  if (typeof window === 'undefined') return;
  
  const isTimeout = error?.message === 'TIMEOUT_AUTH_CHECK' || error?.message === 'TIMEOUT_SESSION_CHECK';
  const isAuthError = error?.status === 400 || error?.status === 401 || 
                      error?.message?.toLowerCase().includes('jwt') || 
                      error?.message?.toLowerCase().includes('session') ||
                      error?.message?.toLowerCase().includes('invalid') ||
                      error?.message?.toLowerCase().includes('refresh_token');

  if (isTimeout || isAuthError) {
    console.warn('Mendeteksi sesi rusak atau timeout. Membersihkan sesi lokal secara paksa...');
    try {
      // Hapus seluruh key di localStorage yang diawali dengan 'sb-' (standard Supabase JWT storage key)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key === 'sch_current_user')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      
      // Logout secara non-blocking
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.auth.signOut().catch(() => {});
      }
    } catch (e) {
      console.error('Gagal membersihkan sesi lokal:', e);
    }
  }
}

// Fungsi pembantu untuk memeriksa apakah mode koneksi Supabase aktif
export function isSupabaseModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  const config = getSupabaseConfig();
  const isConnectedMarker = localStorage.getItem('sch_supabase_connected') === 'true';
  // Aktif jika ada kredensial dan marker terhubung aktif, atau diset via env
  return !!(config.supabaseUrl && config.supabaseAnonKey && (isConnectedMarker || (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)));
}
