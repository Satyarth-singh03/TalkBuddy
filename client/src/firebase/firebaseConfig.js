// ============================================================
//  TalkBuddy — Firebase Configuration (Frontend)
//  This file initializes Firebase for our React app
// ============================================================

// Import Firebase functions we need
import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';

// ── Firebase Config ──────────────────────────────────────────
// These keys are public (safe to be in frontend code)
// They only identify YOUR Firebase project — not grant access
// Real security is handled by Firebase Auth rules on the server
//
// ⚠️  YOU MUST FILL THESE IN with your Firebase project values
// How to get them:
//   1. Go to https://console.firebase.google.com
//   2. Create a project (or open existing)
//   3. Click the </> (Web) icon to register a web app
//   4. Copy the firebaseConfig object shown there
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase — connects our app to Firebase services
const app = initializeApp(firebaseConfig);

// Get the Auth service — this handles login/logout/register
// We export this so any component can use it
export const auth = getAuth(app);

export default app;
