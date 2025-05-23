import React, { useState } from 'react';
import { supabase, logError } from '../supabaseClient';
import '../styles/AuthScreen.css';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [visible, setVisible] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    setMessage('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        logError(error, 'signInWithEmail');
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`);
      logError(error, 'signInWithEmail');
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithEmail() {
    setLoading(true);
    setMessage('');
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        logError(error, 'signUpWithEmail');
      } else {
        setMessage('Check your email for the confirmation link!');
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`);
      logError(error, 'signUpWithEmail');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Noteless</h1>
        <p className="auth-subtitle">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </p>
        
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            autoComplete="email"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-container">
            <input
              id="password"
              type={visible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            <button
              type="button"
              className="visibility-toggle"
              onClick={() => setVisible(!visible)}
            >
              {visible ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        
        {message ? <div className="message">{message}</div> : null}
        
        <button
          className="auth-button"
          onClick={isLogin ? signInWithEmail : signUpWithEmail}
          disabled={loading}
        >
          {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
        
        <button
          className="toggle-auth-mode"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage('');
          }}
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
} 