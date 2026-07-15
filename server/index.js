// ============================================================
//  TalkBuddy — Backend Server (Entry Point)
//  This file starts our Express server and connects all parts
// ============================================================

// "require" is how Node.js imports a library (like "import" in Python)
const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

// Load our secret keys from the .env file into process.env
// Think of .env like a notepad that stores passwords safely
dotenv.config();

// Create the Express "app" — this is our server
const app = express();

// ── Middleware ──────────────────────────────────────────────
// Middleware = code that runs on EVERY request before it hits our routes

// cors() allows our React frontend (port 5173) to talk to this server (port 5000)
// Without this, browsers block requests between different ports for security
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://talk-buddy-pink.vercel.app'
  ],
  credentials: true
}));


// express.json() lets our server understand JSON data sent in request bodies
// When frontend sends { "message": "hello" }, this parses it so we can use it
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
// Routes define what happens when someone calls a specific URL

// Import our chat route (we'll create this file next)
const chatRoute = require('./routes/chat');

// Mount the chat route: any request to /api/chat goes to chatRoute
app.use('/api/chat', chatRoute);

// A simple test route — visit http://localhost:5000/ to confirm server works
app.get('/', (req, res) => {
  res.json({ message: '🤖 TalkBuddy server is running!' });
});

// ── Start the Server ────────────────────────────────────────
// process.env.PORT reads from .env file; if not set, use 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on ${PORT}`);
});
