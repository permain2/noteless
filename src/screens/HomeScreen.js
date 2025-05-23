import React, { useState, useEffect } from 'react';
import { supabase, logError } from '../supabaseClient';
import '../styles/HomeScreen.css';

export default function HomeScreen() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        fetchNotes(user.id);
      } catch (error) {
        console.error('Error getting user:', error);
        logError(error, 'HomeScreen:getUser');
      }
    };
    
    getUser();
  }, []);
  
  const fetchNotes = async (userId) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      logError(error, 'HomeScreen:fetchNotes');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing out:', error);
      logError(error, 'HomeScreen:handleSignOut');
    }
  };
  
  return (
    <div className="home-container">
      <header className="header">
        <h1 className="app-title">Noteless</h1>
        <button onClick={handleSignOut} className="sign-out-button">
          Sign Out
        </button>
      </header>
      
      <div className="main-content">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any notes yet.</p>
            <button className="create-note-button">
              Create your first note
            </button>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <h3 className="note-title">{note.title}</h3>
                <p className="note-excerpt">
                  {note.content.substring(0, 100)}
                  {note.content.length > 100 ? '...' : ''}
                </p>
                <div className="note-footer">
                  <span className="note-date">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button className="create-button">+</button>
    </div>
  );
} 