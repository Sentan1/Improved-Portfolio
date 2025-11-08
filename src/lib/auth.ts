import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { auth } from "./firebase";

// Admin email - use environment variable or fallback
// This will still be visible in the build, but it's better than hardcoding
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "adrian@anda.land";

// Listen for auth state changes
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

// Login with email and password
export async function login(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(error.message || "Failed to login");
  }
}

// Logout
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Logout error:", error);
    throw new Error("Failed to logout");
  }
}

// Check if current user is admin
// This checks if the authenticated user's email matches the admin email
export function isAdminUser(): boolean {
  const user = auth.currentUser;
  if (!user || !user.email) return false;
  return user.email === ADMIN_EMAIL;
}

