import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { 
  ref, 
  uploadString, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { db, storage } from "./firebase";
import type { PortfolioData, Project, Experience } from "./storage";

const PORTFOLIO_DOC_ID = "portfolio_data_v1";

// Check if Firebase is configured
function isFirebaseConfigured(): boolean {
  // Check if we have a valid project ID (either from env or fallback)
  const envConfig = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const fallbackConfig = "portfolio-db982"; // From firebase.ts fallback
  const projectId = envConfig || fallbackConfig;
  return projectId && projectId !== "YOUR_PROJECT_ID" && projectId.length > 0;
}

// Remove undefined values from data (Firestore doesn't allow undefined)
function removeUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle primitives and special types
  if (typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item)).filter(item => item !== undefined) as T;
  }
  
  // Handle objects
  const cleaned: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = (obj as any)[key];
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
  }
  return cleaned as T;
}

// Load portfolio data from Firestore
export async function loadDataFromFirebase(): Promise<PortfolioData | null> {
  if (!isFirebaseConfigured()) {
    console.log("Firebase not configured, using localStorage");
    return null;
  }

  try {
    const docRef = doc(db, "portfolio", PORTFOLIO_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PortfolioData;
      console.log("Loaded data from Firebase");
      return data;
    } else {
      console.log("No data in Firebase, using defaults");
      return null;
    }
  } catch (error) {
    console.error("Error loading from Firebase:", error);
    return null;
  }
}

// Save portfolio data to Firestore
export async function saveDataToFirebase(data: PortfolioData): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log("Firebase not configured, using localStorage");
    return;
  }

  try {
    // Remove undefined values (Firestore doesn't allow undefined)
    const cleanedData = removeUndefined(data);
    
    // Double-check for any remaining undefined values
    const jsonString = JSON.stringify(cleanedData);
    if (jsonString.includes('undefined')) {
      console.warn("Warning: Found undefined in cleaned data, attempting deeper clean");
      // Use JSON parse/stringify to remove undefined
      const doubleCleaned = JSON.parse(JSON.stringify(cleanedData));
      const docRef = doc(db, "portfolio", PORTFOLIO_DOC_ID);
      await setDoc(docRef, doubleCleaned, { merge: true });
    } else {
      const docRef = doc(db, "portfolio", PORTFOLIO_DOC_ID);
      await setDoc(docRef, cleanedData, { merge: true });
    }
    console.log("Saved data to Firebase");
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    // Try one more time with JSON parse/stringify as fallback
    try {
      const fallbackData = JSON.parse(JSON.stringify(data));
      const docRef = doc(db, "portfolio", PORTFOLIO_DOC_ID);
      await setDoc(docRef, fallbackData, { merge: true });
      console.log("Saved data to Firebase (using fallback method)");
    } catch (fallbackError) {
      console.error("Fallback save also failed:", fallbackError);
      throw error;
    }
  }
}

// Upload image to Firebase Storage and return URL
export async function uploadImageToFirebase(
  imageDataUrl: string, 
  projectId: string, 
  imageIndex: number
): Promise<string> {
  if (!isFirebaseConfigured()) {
    // Return data URL if Firebase not configured
    return imageDataUrl;
  }

  try {
    const imageRef = ref(storage, `projects/${projectId}/image_${imageIndex}`);
    await uploadString(imageRef, imageDataUrl, "data_url");
    const downloadURL = await getDownloadURL(imageRef);
    console.log(`Uploaded image ${imageIndex} for project ${projectId}`);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image to Firebase:", error);
    // Fallback to data URL
    return imageDataUrl;
  }
}

// Upload profile photo to Firebase Storage
export async function uploadProfilePhotoToFirebase(
  photoDataUrl: string
): Promise<string> {
  if (!isFirebaseConfigured()) {
    return photoDataUrl;
  }

  try {
    const photoRef = ref(storage, "profile/photo");
    await uploadString(photoRef, photoDataUrl, "data_url");
    const downloadURL = await getDownloadURL(photoRef);
    console.log("Uploaded profile photo to Firebase");
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return photoDataUrl;
  }
}


