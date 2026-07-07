// ============================================================
//  TalkBuddy — Token Verification Middleware
//  This runs BEFORE our chat route to check if user is logged in
// ============================================================

// dotenv must be loaded first so process.env is available
require('dotenv').config();

// Import Firebase Admin SDK (server-side Firebase)
// firebase-admin v12+ uses a named export style
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// ── Initialize Firebase Admin ────────────────────────────────
// getApps() returns a list of already-initialized apps
// We only initialize if the list is empty (prevents double-init on hot reload)
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key is stored with literal \n characters in .env
      // We replace them with real newline characters
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// ============================================================
//  verifyToken — Middleware Function
//  "Middleware" = a function that runs between request and response
//  Parameters:
//    req  = the incoming request (contains data from frontend)
//    res  = the response we'll send back
//    next = call this to move on to the actual route handler
// ============================================================
async function verifyToken(req, res, next) {
  // Get the token from the request headers
  // Frontend sends: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  // Check if header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 401 = "Unauthorized" — user needs to log in
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  // Extract just the token part (remove "Bearer " prefix)
  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Ask Firebase to verify this token is valid and not expired
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Attach user info to the request so the next handler can use it
    req.user = decodedToken; // contains uid, email, etc.

    // ✅ Token is valid — continue to the actual route
    next();
  } catch (error) {
    // Token was invalid, expired, or tampered with
    console.error('Token verification failed:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

module.exports = verifyToken;
