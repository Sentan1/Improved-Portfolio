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
  uploadBytes,
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

// Check if a URL is a Google Cloud Storage URL (that might be broken)
function isGoogleCloudStorageUrl(url: string): boolean {
  if (typeof url !== 'string') return false;
  // Firebase Storage URLs use firebasestorage.googleapis.com - these are OK
  if (url.includes('firebasestorage.googleapis.com')) {
    return false;
  }
  // Check for common Google Cloud Storage URL patterns (but not Firebase Storage)
  return url.includes('storage.googleapis.com') || 
         url.includes('storage.cloud.google.com') ||
         url.includes('googleapis.com/storage') ||
         (url.includes('googleapis.com') && url.includes('/storage/')) ||
         // Also check for other Google Cloud patterns
         (url.includes('cloud.google.com') && url.includes('/storage/')) ||
         url.includes('gs://') || // Google Cloud Storage bucket reference
         url.match(/https?:\/\/[^/]+\.storage\.googleapis\.com/); // Direct bucket URLs
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
function deepCleanForFirestore(data: any, depth: number = 0): any {
  // Prevent infinite recursion
  if (depth > 10) {
    return null;
  }
  
  if (data === null) {
    return null; // Firestore allows null
  }
  
  if (data === undefined) {
    return undefined; // Will be filtered out
  }
  
  // Handle primitives
  if (typeof data !== 'object') {
    // Ensure it's a valid Firestore type
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      return data;
    }
    return String(data); // Convert other primitives to string
  }
  
  // Handle Date objects
  if (data instanceof Date) {
    return data;
  }
  
  // Handle arrays - must contain only valid Firestore types
  if (Array.isArray(data)) {
    const cleaned: any[] = [];
    for (const item of data) {
      const cleanedItem = deepCleanForFirestore(item, depth + 1);
      // Only add valid items (not undefined, and valid Firestore types)
      if (cleanedItem !== undefined && cleanedItem !== null) {
        // Check if it's a valid Firestore type
        const isValidType = 
          typeof cleanedItem === 'string' ||
          typeof cleanedItem === 'number' ||
          typeof cleanedItem === 'boolean' ||
          cleanedItem instanceof Date ||
          (typeof cleanedItem === 'object' && !Array.isArray(cleanedItem));
        
        if (isValidType) {
          cleaned.push(cleanedItem);
        }
      }
    }
    return cleaned.length > 0 ? cleaned : undefined; // Remove empty arrays
  }
  
  // Handle objects
  const cleaned: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      
      // Skip undefined
      if (value === undefined) {
        continue;
      }
      
      // Handle images array - ONLY keep Firebase Storage URLs, NEVER base64 or Google Cloud URLs
      if (key === 'images' && Array.isArray(value)) {
        const imageUrls: string[] = [];
        for (const img of value) {
          if (typeof img === 'string') {
            // ONLY keep HTTP/HTTPS URLs (Firebase Storage URLs)
            // NEVER keep base64 data URLs or broken Google Cloud URLs
            if (img.startsWith('http://') || img.startsWith('https://')) {
              // Filter out Google Cloud Storage URLs (they're broken now)
              if (!isGoogleCloudStorageUrl(img)) {
                imageUrls.push(img);
              }
            }
            // Skip all data: URLs - they should have been uploaded to Storage
          }
        }
        if (imageUrls.length > 0) {
          cleaned[key] = imageUrls;
        }
        // Don't add images array if empty
        continue;
      }
      
      const cleanedValue = deepCleanForFirestore(value, depth + 1);
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
    
    // Final check: remove ALL base64 images and Google Cloud URLs - only keep Firebase Storage URLs
    if (cleanedData.projects && Array.isArray(cleanedData.projects)) {
      cleanedData.projects = cleanedData.projects.map((p: any) => {
        if (p.images && Array.isArray(p.images)) {
          // ONLY keep HTTP/HTTPS URLs - remove ALL base64 data URLs and Google Cloud URLs
          p.images = p.images.filter((img: any) => {
            if (typeof img !== 'string' || (!img.startsWith('http://') && !img.startsWith('https://'))) {
              return false;
            }
            // Remove Google Cloud Storage URLs (they're broken now)
            if (isGoogleCloudStorageUrl(img)) {
              console.warn(`Removing broken Google Cloud Storage URL from project "${p.title}": ${img.substring(0, 50)}...`);
              return false;
            }
            return true;
          });
          // Remove images array if empty
          if (p.images.length === 0) {
            delete p.images;
          }
        }
        // Clean all other fields too
        const cleanedProject: any = {};
        for (const key in p) {
          if (p.hasOwnProperty(key) && p[key] !== undefined) {
            cleanedProject[key] = p[key];
          }
        }
        return cleanedProject;
      });
    }
    
    // Final validation - log what we're about to save
    const dataSize = JSON.stringify(cleanedData).length;
    console.log(`Saving to Firebase, data size: ${(dataSize / 1024).toFixed(2)} KB`);
    
    // Check for any remaining issues
    if (cleanedData.projects) {
      cleanedData.projects.forEach((p: any, idx: number) => {
        if (p.images) {
          p.images.forEach((img: any, imgIdx: number) => {
            if (typeof img !== 'string' || (!img.startsWith('http://') && !img.startsWith('https://'))) {
              console.warn(`Project ${idx} image ${imgIdx} is not a valid URL:`, typeof img, img?.substring?.(0, 50));
            }
          });
        }
      });
    }
    
    await setDoc(docRef, cleanedData, { merge: true });
    console.log("Saved data to Firebase");
  } catch (error: any) {
    console.error("Error saving to Firebase:", error);
    console.error("Error details:", error.message);
    console.error("Error code:", error.code);
    // Log a sample of the data to help debug
    if (cleanedData.projects && cleanedData.projects.length > 0) {
      console.error("Sample project data:", JSON.stringify(cleanedData.projects[0], null, 2).substring(0, 500));
    }
    throw error;
  }
}

// Convert data URL to Blob
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
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
    
    // Try using uploadBytes with Blob first (better CORS handling)
    try {
      const blob = dataURLtoBlob(imageDataUrl);
      await uploadBytes(imageRef, blob, {
        contentType: blob.type,
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
      });
      const downloadURL = await getDownloadURL(imageRef);
      console.log(`Uploaded image ${imageIndex} for project ${projectId} using uploadBytes`);
      return downloadURL;
    } catch (blobError) {
      // Fallback to uploadString if uploadBytes fails
      console.log(`uploadBytes failed, trying uploadString:`, blobError);
      await uploadString(imageRef, imageDataUrl, "data_url");
      const downloadURL = await getDownloadURL(imageRef);
      console.log(`Uploaded image ${imageIndex} for project ${projectId} using uploadString`);
      return downloadURL;
    }
  } catch (error: any) {
    console.error("Error uploading image to Firebase:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // If it's a CORS error, provide helpful message
    if (error.message?.includes('CORS') || error.code === 'storage/unauthorized') {
      throw new Error(`CORS error: Firebase Storage needs to allow uploads from sentan1.github.io. Please check Storage security rules and CORS configuration.`);
    }
    
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


