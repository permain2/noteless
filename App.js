import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { supabase } from './supabaseClient';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';

// Add console logs to track initialization
console.log('App.js: Starting initialization');
console.log('Platform:', require('react-native').Platform.OS);

// Add browser error tracking
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  // Save current error log to localStorage on errors
  window.addEventListener('error', (event) => {
    try {
      const errorLogs = JSON.parse(localStorage.getItem('noteless_error_log') || '[]');
      errorLogs.push({
        time: new Date().toISOString(),
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack || 'No stack trace'
      });
      // Keep only the last 20 errors
      localStorage.setItem('noteless_error_log', JSON.stringify(errorLogs.slice(-20)));
    } catch (e) {
      // Ignore localStorage errors
    }
  });
  
  // Add unhandled promise rejection tracking
  window.addEventListener('unhandledrejection', (event) => {
    try {
      const errorLogs = JSON.parse(localStorage.getItem('noteless_error_log') || '[]');
      errorLogs.push({
        time: new Date().toISOString(),
        type: 'unhandledrejection',
        message: event.reason?.message || 'Unknown promise rejection',
        stack: event.reason?.stack || 'No stack trace'
      });
      localStorage.setItem('noteless_error_log', JSON.stringify(errorLogs.slice(-20)));
    } catch (e) {
      // Ignore localStorage errors
    }
  });
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const getSession = async () => {
    setError(null);
    try {
      console.log('Getting session from Supabase');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setError(error.message);
      }
      
      console.log('Session retrieved:', session ? 'Yes' : 'No');
      setSession(session);
      setLoading(false);
    } catch (err) {
      console.error('Exception in getSession:', err);
      setError(err.message || 'Failed to connect to Supabase');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('App.js: useEffect running - checking session');
    
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event);
      setSession(session);
      if (_event !== 'INITIAL_SESSION') {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Handle manual retry
  const handleRetry = () => {
    console.log('App.js: Retrying authentication');
    setLoading(true);
    setRetryCount(prev => prev + 1);
    getSession();
  };
  
  // Auto-retry logic for web
  useEffect(() => {
    if (error && Platform.OS === 'web' && retryCount < 3) {
      // Auto-retry on connection errors, with increasing delay
      const isConnectionError = error.toLowerCase().includes('network') || 
                               error.toLowerCase().includes('connect') ||
                               error.toLowerCase().includes('offline');
      
      if (isConnectionError) {
        const delay = (retryCount + 1) * 2000; // 2s, 4s, 6s
        console.log(`Auto-retrying in ${delay/1000}s due to connection error`);
        
        const timer = setTimeout(() => {
          handleRetry();
        }, delay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [error, retryCount]);

  // Add better error handling and fallback UI
  if (loading) {
    console.log('App.js: Rendering loading state');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Laster...</Text>
      </View>
    );
  }

  // Add error UI with retry button
  if (error) {
    console.log('App.js: Rendering error state:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorHeading}>Kunne ikke koble til</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Prøv igjen</Text>
        </TouchableOpacity>
        {Platform.OS === 'web' && (
          <TouchableOpacity 
            style={styles.reportButton} 
            onPress={() => {
              try {
                const errorLogs = JSON.parse(localStorage.getItem('noteless_error_log') || '[]');
                alert('Error logs: ' + JSON.stringify(errorLogs, null, 2));
              } catch (e) {
                alert('No error logs available');
              }
            }}
          >
            <Text style={styles.reportButtonText}>Vis feillogger</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  console.log('App.js: Rendering main UI, session exists:', !!session);
  
  try {
    return (
      <>
        {session && session.user ? <HomeScreen /> : <AuthScreen />}
      </>
    );
  } catch (error) {
    console.error('Error rendering main UI:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorHeading}>Noe gikk galt</Text>
        <Text style={styles.errorText}>En uventet feil oppstod under lasting av appen.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Prøv igjen</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 400,
  },
  retryButton: {
    backgroundColor: '#3730a3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  reportButtonText: {
    color: '#6b7280',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
}); 