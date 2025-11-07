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

  const docRef = doc(db, "portfolio", PORTFOLIO_DOC_ID);
  
  try {
    // Always use JSON parse/stringify to remove undefined and handle large data
    // This also ensures we don't exceed Firestore document size limits
    const cleanedData = JSON.parse(JSON.stringify(data));
    
    // Firestore has a 1MB limit per document, so we need to be careful with images
    // Images should already be uploaded to Storage, so we should only have URLs here
    await setDoc(docRef, cleanedData, { merge: true });
    console.log("Saved data to Firebase");
  } catch (error: any) {
    console.error("Error saving to Firebase:", error);
    
    // If error is about document size, try to remove large image data URLs
    if (error.message && (error.message.includes("size") || error.message.includes("larger"))) {
      console.warn("Document too large, attempting to clean image data...");
      try {
        const cleaned = JSON.parse(JSON.stringify(data));
        // Remove any base64 data URLs that are too large (keep only Storage URLs)
        if (cleaned.projects) {
          cleaned.projects = cleaned.projects.map((p: any) => {
            if (p.images && Array.isArray(p.images)) {
              p.images = p.images.filter((img: string) => {
                // Keep only Firebase Storage URLs or small data URLs
                return img.startsWith('http') || img.length < 100000; // Keep URLs or small previews
              });
            }
            return p;
          });
        }
        await setDoc(docRef, cleaned, { merge: true });
        console.log("Saved data to Firebase (after cleaning large images)");
      } catch (fallbackError) {
        console.error("Fallback save also failed:", fallbackError);
        throw error;
      }
    } else {
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


