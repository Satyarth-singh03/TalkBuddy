// ============================================================
//  TalkBuddy — App Root Component
//  Sets up page routing (which page shows based on URL)
// ============================================================

// React is the core library — needed in every component file
import React from 'react';

// BrowserRouter, Routes, Route — these handle navigation
// BrowserRouter: wraps everything to enable routing
// Routes: container for all your routes
// Route: defines one URL → component mapping
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import our pages
import LoginPage  from './pages/LoginPage';
import ChatPage   from './pages/ChatPage';

// Import the CSS (applies globally to every page)
import './index.css';

// ============================================================
//  ProtectedRoute Component
//  A wrapper that checks if user is logged in before showing a page
//  If not logged in → redirect to /login
// ============================================================
function ProtectedRoute({ children }) {
  // Check localStorage for a saved user session
  // When user logs in, we save their email in localStorage
  const user = localStorage.getItem('talkbuddy_user');
  
  // If no user found, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Otherwise, show the actual page (children = whatever is wrapped inside)
  return children;
}

// ============================================================
//  App Component — The Root of Everything
//  This is the FIRST component React renders
// ============================================================
function App() {
  return (
    // BrowserRouter enables URL-based navigation
    <BrowserRouter>
      {/* Routes = only one Route matches at a time */}
      <Routes>
        {/* Root URL "/" → redirect to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* /login → show LoginPage */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* /chat → show ChatPage (only if logged in) */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
