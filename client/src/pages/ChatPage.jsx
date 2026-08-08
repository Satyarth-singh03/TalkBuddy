import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import axios from 'axios';
import Logo from '../components/Logo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const chatEndRef = useRef(null);
  const userEmail = localStorage.getItem('talkbuddy_user') || 'User';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function sendMessage(text) {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    setMessages(prev => [...prev, { type: 'user', text: trimmedText }]);
    setInput('');
    setIsLoading(true);

    try {
      const idToken = await auth.currentUser?.getIdToken();

      const response = await axios.post(
        `${API_URL}/api/chat`,
        { message: trimmedText },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { aiReply, rewrittenMessage } = response.data;

      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          text: aiReply,
          rewrite: rewrittenMessage,
        },
      ]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setMessages(prev => [
        ...prev,
        { type: 'ai', text: `❌ ${errorMsg}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  async function copyToClipboard(text, index) {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleLogout() {
    await signOut(auth);
    localStorage.removeItem('talkbuddy_user');
    navigate('/login');
  }

  return (
    <div className="chat-page">
      <nav className="navbar">
        <div className="navbar-brand">
          <Logo size={32} variant="silhouette" className="brand-icon" />
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

      <div className="chat-area">
        {messages.length === 0 && (
          <div className="welcome-message">
            <Logo size={80} variant="primary" style={{ marginBottom: '20px', filter: 'drop-shadow(var(--shadow-red))' }} />
            <h2>Hello! I'm TalkBuddy</h2>
            <p>
              I'm here to help you upgrade your professional communication skills.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className="message-group">
            {msg.type === 'user' && (
              <div className="message-user">
                <div className="bubble-user">{msg.text}</div>
              </div>
            )}

            {msg.type === 'ai' && (
              <>
                <div className="message-ai">
                  <Logo size={36} variant="primary" style={{ flexShrink: 0 }} />
                  <div className="bubble-ai">{msg.text}</div>
                </div>

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

        {isLoading && (
          <div className="typing-indicator">
            <Logo size={36} variant="primary" style={{ flexShrink: 0 }} />
            <div className="typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

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

