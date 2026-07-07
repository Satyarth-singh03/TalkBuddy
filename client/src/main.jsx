// ============================================================
//  TalkBuddy — React Entry Point
//  This is the FIRST file that runs when the browser loads
//  It "mounts" (attaches) React to the HTML page
// ============================================================

import React    from 'react';
import ReactDOM from 'react-dom/client';
import App      from './App.jsx';

// This finds the <div id="root"> in index.html and makes React take it over
// Everything our app renders will go inside that div
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode helps catch bugs during development (has no effect in production)
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
