import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import './App.css';

function App() {
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
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Handle manual retry
  const handleRetry = () => {
    console.log('App.js: Retrying authentication');
    setLoading(true);
    setRetryCount(prev => prev + 1);
    getSession();
  };
  
  // Auto-retry logic
  useEffect(() => {
    if (error && retryCount < 3) {
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2 className="error-heading">Could not connect</h2>
        <p className="error-text">{error}</p>
        <button className="retry-button" onClick={handleRetry}>
          Try Again
        </button>
        <button 
          className="report-button" 
          onClick={() => {
            try {
              const errorLogs = JSON.parse(localStorage.getItem('noteless_error_log') || '[]');
              alert('Error logs: ' + JSON.stringify(errorLogs, null, 2));
            } catch (e) {
              alert('No error logs available');
            }
          }}
        >
          Show Error Logs
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {session && session.user ? <HomeScreen /> : <AuthScreen />}
    </div>
  );
}

export default App; 