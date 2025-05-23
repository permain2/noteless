import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://yvbfwlschpufqihnaldt.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YmZ3bHNjaHB1ZnFpaG5hbGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY0MDI4MzIsImV4cCI6MjAzMTk3ODgzMn0.9hIPtA0ILVBHaGq84I9U3igxQ-1uWECm1mJICd_sBW8';

if (typeof window !== 'undefined') {
  console.log('Running in browser environment, setting up enhanced logging');
  
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  
  console.error = function(...args) {
    originalConsoleError.apply(console, args);
    
    try {
      const previousErrors = JSON.parse(localStorage.getItem('noteless_error_log') || '[]');
      const newError = {
        timestamp: new Date().toISOString(),
        message: args.map(arg => {
          try {
            return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
          } catch (e) {
            return 'Unstringifiable object';
          }
        }).join(' '),
      };
      previousErrors.push(newError);
      localStorage.setItem('noteless_error_log', JSON.stringify(previousErrors.slice(-20)));
    } catch (e) {
      // Fail silently
    }
  };
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 10 chars):', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'undefined');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials! Using fallback values.');
}

const createClientWithRetry = (retryCount = 0, maxRetries = 3) => {
  try {
    console.log(`Attempting to initialize Supabase client (attempt ${retryCount + 1} of ${maxRetries + 1})`);
    
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (...args) => {
          const [url, options] = args;
          const controller = new AbortController();
          const timeout = setTimeout(() => {
            controller.abort();
          }, 8000);
          
          return fetch(url, {
            ...options,
            signal: controller.signal,
          }).finally(() => {
            clearTimeout(timeout);
          });
        }
      }
    });
    
    client.auth.getSession()
      .then(() => console.log('Supabase client successfully connected'))
      .catch(error => console.error('Error testing Supabase connection:', error));
    
    console.log('Supabase client initialized successfully');
    return client;
  } catch (error) {
    console.error(`Failed to initialize Supabase client (attempt ${retryCount + 1}):`, error);
    
    if (retryCount < maxRetries) {
      console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
      if (typeof window !== 'undefined') {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(createClientWithRetry(retryCount + 1, maxRetries));
          }, (retryCount + 1) * 1000);
        });
      } else {
        return createClientWithRetry(retryCount + 1, maxRetries);
      }
    }
    
    throw new Error('Failed to initialize Supabase after multiple attempts: ' + error.message);
  }
};

let supabase;
try {
  supabase = createClientWithRetry();
  
  if (supabase instanceof Promise) {
    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    
    supabase = tempClient;
    
    createClientWithRetry().then(finalClient => {
      supabase = finalClient;
      console.log('Supabase client replaced with retry result');
    }).catch(e => {
      console.error('Final Supabase initialization failed:', e);
    });
  }
} catch (error) {
  console.error('Critical error initializing Supabase:', error);
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

supabase.checkConnection = async () => {
  try {
    const start = Date.now();
    const { data, error } = await supabase.auth.getSession();
    const elapsed = Date.now() - start;
    
    return {
      success: !error,
      latency: elapsed,
      error: error || null
    };
  } catch (e) {
    return {
      success: false,
      error: e
    };
  }
};

export { supabase }; 