// ============================================================
//  TalkBuddy — Chat Page
//  The main screen where users chat with TalkBuddy AI
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import axios from 'axios';

// ── API base URL from .env ───────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Example starter chips (quick message suggestions) ───────
const STARTER_CHIPS = [
  'How do I introduce myself?',
  'How should I ask for help?',
  'How do I interact with others?',
  'How do I say no professionally?',
];

// ============================================================
//  ChatPage Component
// ============================================================
function ChatPage() {
  const navigate  = useNavigate();
  
  // messages = array of chat messages
  // Each message object: { type: 'user'|'ai', text, rewrite? }
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');   // Current text in textarea
  const [isLoading, setIsLoading] = useState(false); // Shows typing indicator
  const [copied,    setCopied]    = useState(null);  // Tracks which rewrite was copied

  // useRef creates a reference to a DOM element
  // We use this to auto-scroll the chat area to the bottom
  const chatEndRef = useRef(null);
  
  // Get user info from localStorage
  const userEmail = localStorage.getItem('talkbuddy_user') || 'User';

  // ── useEffect ───────────────────────────────────────────────
  // useEffect runs code AFTER the component renders
  // The [] means "run only once, when component first loads"
  useEffect(() => {
    // Auto-scroll to bottom whenever messages update
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]); // Re-run when messages or loading state changes

  // ── Send Message ────────────────────────────────────────────
  async function sendMessage(text) {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    // Add user's message to the chat immediately
    // [...messages] = spread operator, creates a copy of the array
    setMessages(prev => [...prev, { type: 'user', text: trimmedText }]);
    setInput('');
    setIsLoading(true);

    try {
      // Get the Firebase ID token to authenticate the request
      // currentUser is the logged-in user object from Firebase
      const idToken = await auth.currentUser?.getIdToken();

      // POST request to our backend
      // axios.post(url, data, config)
      const response = await axios.post(
        `${API_URL}/api/chat`,
        { message: trimmedText },
        {
          headers: {
            // Send the token in the Authorization header
            // Backend's verifyToken middleware will check this
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { aiReply, rewrittenMessage } = response.data;

      // Add AI response + rewritten message to the chat
      setMessages(prev => [
        ...prev,
        {
          type:    'ai',
          text:    aiReply,
          rewrite: rewrittenMessage,
        },
      ]);

    } catch (err) {
      // If the request failed, show an error message in chat
      const errorMsg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setMessages(prev => [
        ...prev,
        { type: 'ai', text: `❌ ${errorMsg}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Handle textarea key press ───────────────────────────────
  function handleKeyDown(e) {
    // Send on Enter, but allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // ── Copy rewrite to clipboard ───────────────────────────────
  async function copyToClipboard(text, index) {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000); // Reset after 2 seconds
  }

  // ── Logout ─────────────────────────────────────────────────
  async function handleLogout() {
    await signOut(auth);
    localStorage.removeItem('talkbuddy_user');
    navigate('/login');
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="chat-page">

      {/* ── Top Navigation Bar ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">🤖</span>
          <div>
            <h2>TalkBuddy</h2>
            <span className="brand-tagline">Professional Communication Coach</span>
          </div>
        </div>
        <div className="navbar-user">
          <span className="user-email">👤 {userEmail}</span>
          <button id="logout-btn" className="btn-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Scrollable Chat Area ── */}
      <div className="chat-area">

        {/* Show welcome screen when there are no messages yet */}
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-avatar">🤖</div>
            <h2>Hello! I'm TalkBuddy</h2>
            <p>
              I'm here to help you upgrade your professional communication skills.
            </p>
            {/* Quick suggestion chips */}
            <div className="welcome-chips">
              {STARTER_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  className="chip"
                  onClick={() => sendMessage(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Render Messages ── */}
        {messages.map((msg, index) => (
          <div key={index} className="message-group">

            {/* User message → right side */}
            {msg.type === 'user' && (
              <div className="message-user">
                <div className="bubble-user">{msg.text}</div>
              </div>
            )}

            {/* AI message → left side with avatar */}
            {msg.type === 'ai' && (
              <>
                <div className="message-ai">
                  <div className="ai-avatar">🤖</div>
                  <div className="bubble-ai">{msg.text}</div>
                </div>

                {/* Rewrite Box — only show if we have a rewritten message */}
                {msg.rewrite && (
                  <div className="rewrite-box">
                    <div className="rewrite-label">
                      <span>✨</span>
                      <span>Polished version of your message</span>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(msg.rewrite, index)}
                        title="Copy to clipboard"
                      >
                        {copied === index ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <div className="rewrite-text">"{msg.rewrite}"</div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {/* ── Typing Indicator — shows while AI is generating ── */}
        {isLoading && (
          <div className="typing-indicator">
            <div className="ai-avatar">🤖</div>
            <div className="typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* Invisible element at the bottom — we scroll to this */}
        <div ref={chatEndRef} />
      </div>

      {/* ── Input Panel ── */}
      <div className="input-panel">
        <div className="input-wrapper">
          <textarea
            id="message-input"
            className="message-textarea"
            placeholder="Type your message here..."
            value={input}
            rows={1}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize textarea based on content
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            id="send-btn"
            className="send-btn"
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            title="Send message"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </div>

    </div>
  );
}

export default ChatPage;
