import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your Firebase config
// Uses environment variables if available (local dev), otherwise falls back to production values
// Note: Firebase config values are public - security comes from Firebase Security Rules
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBHHUAqIR7erJxg_OtQDRjbQD6B-owl4d8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "portfolio-db982.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "portfolio-db982",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "portfolio-db982.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "137456975079",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:137456975079:web:f3a83438c07125bea2b642"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (database)
export const db = getFirestore(app);

// Initialize Firebase Storage (for images)
export const storage = getStorage(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;


