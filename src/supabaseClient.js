import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

// Create a localStorage adapter for web environments
const localStorageAdapter = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('localStorage getItem error:', e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('localStorage setItem error:', e);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('localStorage removeItem error:', e);
    }
  }
};

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

// Utility to log errors to persistent storage for debugging
export const logError = (error, context = '') => {
  try {
    // Get existing logs from storage
    const logsString = localStorage.getItem('noteless_error_log');
    const logs = JSON.parse(logsString || '[]');
    
    // Add new log entry
    logs.push({
      timestamp: new Date().toISOString(),
      error: error.message || String(error),
      stack: error.stack || '',
      context
    });
    
    // Keep only the most recent 20 errors to prevent storage issues
    const recentLogs = logs.slice(-20);
    
    // Save back to storage
    localStorage.setItem('noteless_error_log', JSON.stringify(recentLogs));
  } catch (e) {
    // Last resort logging if everything else fails
    console.error('Critical error in error logging system:', e);
  }
}; 