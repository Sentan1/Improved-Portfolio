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

// Deep clean data for Firestore - removes undefined, null arrays, and large base64 images
function deepCleanForFirestore(data: any): any {
  if (data === null || data === undefined) {
    return null; // Firestore allows null but not undefined
  }
  
  if (typeof data !== 'object') {
    return data;
  }
  
  if (Array.isArray(data)) {
    const cleaned = data
      .map(item => deepCleanForFirestore(item))
      .filter(item => item !== undefined && item !== null);
    return cleaned.length > 0 ? cleaned : undefined; // Remove empty arrays
  }
  
  const cleaned: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      
      // Skip undefined
      if (value === undefined) {
        continue;
      }
      
      // Handle images array - remove base64 data URLs, keep only Storage URLs
      if (key === 'images' && Array.isArray(value)) {
        const imageUrls = value
          .filter((img: string) => {
            // Keep only Firebase Storage URLs (http/https) or very small previews
            if (typeof img === 'string') {
              return img.startsWith('http') || (img.startsWith('data:') && img.length < 50000);
            }
            return false;
          })
          .map((img: string) => deepCleanForFirestore(img));
        if (imageUrls.length > 0) {
          cleaned[key] = imageUrls;
        }
        continue;
      }
      
      const cleanedValue = deepCleanForFirestore(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
  }
  
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

// Save portfolio data to Firestore
export async function saveDataToFirebase(data: PortfolioData): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log("Firebase not configured, using localStorage");
    return;
  }

  const docRef = doc(db, "portfolio", PORTFOLIO_DOC_ID);
  
  try {
    // Deep clean the data - remove undefined, clean arrays, remove large base64 images
    let cleanedData = deepCleanForFirestore(data);
    
    // Double pass with JSON to ensure no undefined values
    cleanedData = JSON.parse(JSON.stringify(cleanedData));
    
    // Final check: remove any base64 images that are too large
    if (cleanedData.projects && Array.isArray(cleanedData.projects)) {
      cleanedData.projects = cleanedData.projects.map((p: any) => {
        if (p.images && Array.isArray(p.images)) {
          p.images = p.images.filter((img: string) => {
            // Only keep Storage URLs or very small data URLs
            return typeof img === 'string' && (
              img.startsWith('http') || 
              (img.startsWith('data:') && img.length < 50000)
            );
          });
          // Remove images array if empty
          if (p.images.length === 0) {
            delete p.images;
          }
        }
        return p;
      });
    }
    
    await setDoc(docRef, cleanedData, { merge: true });
    console.log("Saved data to Firebase");
  } catch (error: any) {
    console.error("Error saving to Firebase:", error);
    console.error("Error details:", error.message);
    throw error;
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


