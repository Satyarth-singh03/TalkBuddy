// ============================================================
//  TalkBuddy — Login Page
//  Handles user registration and sign-in using Firebase Auth
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Firebase Auth functions
import {
  createUserWithEmailAndPassword,  // For registration
  signInWithEmailAndPassword,       // For login
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

// ============================================================
//  useState — React's way to store data that can change
//  Syntax: const [value, setValue] = useState(initialValue)
//  When setValue() is called → component re-renders with new value
// ============================================================
function LoginPage() {
  const navigate = useNavigate(); // Hook to programmatically change pages

  // Which tab is active: 'login' or 'register'
  const [activeTab, setActiveTab] = useState('login');
  
  // Form field values
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // ── Handle Form Submit ─────────────────────────────────────
  async function handleSubmit(e) {
    // e.preventDefault() stops the page from refreshing on form submit
    e.preventDefault();
    setError('');   // Clear any previous error
    setLoading(true);

    try {
      let userCredential;

      if (activeTab === 'register') {
        // Create new account
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Sign into existing account
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      // Save user email in localStorage so ProtectedRoute knows they're logged in
      localStorage.setItem('talkbuddy_user', userCredential.user.email);
      
      // Navigate to the chat page
      navigate('/chat');

    } catch (err) {
      // Firebase gives error codes like "auth/invalid-email"
      // We convert them to friendly messages
      setError(getFriendlyError(err.code));
    } finally {
      // "finally" runs whether success or error — stop the loading spinner
      setLoading(false);
    }
  }

  // ── Convert Firebase error codes to readable messages ──────
  function getFriendlyError(code) {
    const errors = {
      'auth/email-already-in-use':    'This email is already registered. Try logging in.',
      'auth/invalid-email':           'Please enter a valid email address.',
      'auth/weak-password':           'Password must be at least 6 characters.',
      'auth/user-not-found':          'No account found with this email.',
      'auth/wrong-password':          'Incorrect password. Please try again.',
      'auth/invalid-credential':      'Invalid email or password.',
      'auth/too-many-requests':       'Too many attempts. Please wait and try again.',
    };
    return errors[code] || 'Something went wrong. Please try again.';
  }

  // ── Render the Login UI ────────────────────────────────────
  // In React, we return JSX (looks like HTML but it's actually JavaScript)
  return (
    <div className="login-page">
      <div className="login-card glass-card">
        
        {/* Logo Section */}
        <div className="login-logo">
          <span className="logo-icon">🤖</span>
          <h1>TalkBuddy</h1>
          <p>Your AI-powered professional communication coach</p>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div className="login-tabs">
          <button
            className={`login-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              id="email-input"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}  // Update state as user types
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              id="password-input"
              type="password"
              className="form-input"
              placeholder={activeTab === 'register' ? 'Min. 6 characters' : 'Your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error Message */}
          {error && <div className="error-message">⚠️ {error}</div>}

          {/* Submit Button */}
          <button id="submit-btn" type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Please wait...' : activeTab === 'login' ? '🚀 Sign In' : '✨ Create Account'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default LoginPage;
