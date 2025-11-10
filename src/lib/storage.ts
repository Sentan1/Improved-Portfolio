import { isAuthenticated } from "./auth";

export type Project = {
  id: string;
  title: string;
  description: string;
  category?: string; // e.g., "React", "Native", "3D Modelling"
  filterCategory?: string; // Third category for filtering (e.g., "Web", "Mobile", "Game", "Design")
  tech: string[]; // general tags like "Tech", "Stack", "Here"
  images?: string[]; // base64 data URLs
  color?: string; // tailwind gradient suffix for fallback styling
};

export type Experience = {
  id: string;
  name: string;
  level: number; // 0-100
};

export type AboutContent = {
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  skills?: string[];
};

export type PortfolioData = {
  projects: Project[];
  experience: Experience[];
  profilePhoto?: string; // base64 data URL for profile photo
  aboutContent?: AboutContent;
  heroText?: string; // Hero section text (editable by admin)
};

const STORAGE_KEY = "portfolio:data:v1";
const ADMIN_KEY = "portfolio:admin";

export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function getDefaultData(): PortfolioData {
  return {
    projects: [
      {
        id: generateId("proj"),
        title: "Project One",
        description: "Add your project description here",
        tech: ["Tech", "Stack", "Here"],
        color: "from-slate-700 to-slate-800",
      },
      {
        id: generateId("proj"),
        title: "Project Two",
        description: "Add your project description here",
        tech: ["Tech", "Stack", "Here"],
        color: "from-slate-600 to-slate-700",
      },
      {
        id: generateId("proj"),
        title: "Project Three",
        description: "Add your project description here",
        tech: ["Tech", "Stack", "Here"],
        color: "from-slate-800 to-slate-900",
      },
    ],
    experience: [
      { id: generateId("exp"), name: "JavaScript", level: 20 },
      { id: generateId("exp"), name: "React", level: 20 },
      { id: generateId("exp"), name: "TypeScript", level: 20 },
      { id: generateId("exp"), name: "Node.js", level: 15 },
      { id: generateId("exp"), name: "CSS/Tailwind", level: 30 },
      { id: generateId("exp"), name: "Python", level: 40 },
      { id: generateId("exp"), name: "UI/UX Design", level: 50 },
      { id: generateId("exp"), name: "Java", level: 60 },
    ],
  };
}

export async function loadData(): Promise<PortfolioData> {
  // Try Firebase first if configured
  try {
    const { loadDataFromFirebase } = await import("./firebaseStorage");
    const firebaseData = await loadDataFromFirebase();
    if (firebaseData) {
      console.log("Firebase data received:", firebaseData);
      
      // Ensure projects and experience are arrays
      if (!Array.isArray(firebaseData.projects)) {
        console.warn("Projects is not an array, setting to empty array");
        firebaseData.projects = [];
      }
      if (!Array.isArray(firebaseData.experience)) {
        console.warn("Experience is not an array, setting to empty array");
        firebaseData.experience = [];
      }
      
      // Migrate older single-image shape to images[]
      firebaseData.projects = firebaseData.projects.map((p: any) => {
        if (!p.images && p.imageDataUrl) {
          return { ...p, images: [p.imageDataUrl] } as Project;
        }
        return p as Project;
      });
      
      // Clean up: Remove any base64 images that are too large (keep only Storage URLs)
      firebaseData.projects = firebaseData.projects.map((p: any) => {
        if (p.images && Array.isArray(p.images)) {
          p.images = p.images.filter((img: string) => {
            // Only keep HTTP/HTTPS URLs - remove all base64 data URLs
            return typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'));
          });
          // Remove images array if empty
          if (p.images.length === 0) {
            delete p.images;
          }
        }
        return p;
      });
      
      console.log("Processed Firebase data - projects:", firebaseData.projects.length, "experience:", firebaseData.experience.length);
      
      // Also save to localStorage as backup
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(firebaseData));
      } catch {}
      return firebaseData;
    }
  } catch (error) {
    console.log("Firebase not available, using localStorage:", error);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw) as PortfolioData;
    if (!parsed.projects || !parsed.experience) return getDefaultData();
    // migrate older single-image shape to images[]
    parsed.projects = parsed.projects.map((p: any) => {
      if (!p.images && p.imageDataUrl) {
        return { ...p, images: [p.imageDataUrl] } as Project;
      }
      return p as Project;
    });
    
    // Clean up: Remove any base64 images that are too large (keep only Storage URLs)
    parsed.projects = parsed.projects.map((p: any) => {
      if (p.images && Array.isArray(p.images)) {
        p.images = p.images.filter((img: string) => {
          // Only keep HTTP/HTTPS URLs - remove all base64 data URLs
          return typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'));
        });
        // Remove images array if empty
        if (p.images.length === 0) {
          delete p.images;
        }
      }
      return p;
    });
    
    return parsed;
  } catch {
    return getDefaultData();
  }
}

// Synchronous version for backwards compatibility (returns default data, will be updated async)
export function loadDataSync(): PortfolioData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw) as PortfolioData;
    if (!parsed.projects || !parsed.experience) return getDefaultData();
    parsed.projects = parsed.projects.map((p: any) => {
      if (!p.images && p.imageDataUrl) {
        return { ...p, images: [p.imageDataUrl] } as Project;
      }
      return p as Project;
    });
    return parsed;
  } catch {
    return getDefaultData();
  }
}

export async function saveData(data: PortfolioData): Promise<void> {
  // Try Firebase first if configured
  try {
    const { saveDataToFirebase } = await import("./firebaseStorage");
    await saveDataToFirebase(data);
    console.log("Saved to Firebase");
  } catch (error) {
    console.log("Firebase save failed, using localStorage:", error);
  }

  // Always save to localStorage as backup
  try {
    const jsonData = JSON.stringify(data);
    // Check approximate size (rough estimate: 1 char ≈ 1 byte)
    const sizeInMB = (jsonData.length / (1024 * 1024)).toFixed(2);
    console.log(`Saving data, approximate size: ${sizeInMB} MB`);
    
    // localStorage typically has 5-10MB limit depending on browser
    if (jsonData.length > 8 * 1024 * 1024) { // 8MB warning (approaching typical limit)
      console.warn('Data size is large, may exceed localStorage quota (typically 5-10MB)');
    }
    
    localStorage.setItem(STORAGE_KEY, jsonData);
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      const currentSize = JSON.stringify(data).length;
      const sizeInMB = (currentSize / (1024 * 1024)).toFixed(2);
      console.error(`localStorage quota exceeded. Current size: ${sizeInMB} MB. Browser limit is typically 5-10MB.`);
      throw new Error(`Storage quota exceeded (${sizeInMB} MB). Browser localStorage limit is typically 5-10MB. Please remove some projects or use smaller images.`);
    }
    throw error;
  }
}

export function isAdmin(): boolean {
  // Use Firebase Authentication - password is stored server-side!
  if (typeof window === "undefined") return false;
  
  try {
    // Check Firebase Auth (password is NOT in code!)
    return isAuthenticated();
  } catch {
    // Fallback to localStorage (for compatibility during transition)
    try {
      return localStorage.getItem(ADMIN_KEY) === "true";
    } catch {
      return false;
    }
  }
}

export function setAdmin(enabled: boolean): void {
  // This function is kept for compatibility, but Firebase Auth handles this now
  if (typeof window === "undefined") return;
  if (!enabled) {
    // Only clear localStorage if logging out
    try {
      localStorage.removeItem(ADMIN_KEY);
    } catch {
      // Ignore
    }
  }
}

export async function addProject(project: Omit<Project, "id">): Promise<Project> {
  const data = await loadData();
  const newProject: Project = { id: generateId("proj"), ...project };
  data.projects.unshift(newProject);
  await saveData(data);
  return newProject;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const data = await loadData();
  data.projects = data.projects.map((p) => (p.id === id ? { ...p, ...updates, id: p.id } : p));
  await saveData(data);
}

export async function deleteProject(id: string): Promise<void> {
  const data = await loadData();
  data.projects = data.projects.filter((p) => p.id !== id);
  await saveData(data);
}

export async function addExperience(exp: Omit<Experience, "id">): Promise<Experience> {
  const data = await loadData();
  const newExp: Experience = { id: generateId("exp"), ...exp };
  data.experience.push(newExp);
  await saveData(data);
  return newExp;
}

export async function updateExperience(id: string, updates: Partial<Experience>): Promise<void> {
  const data = await loadData();
  data.experience = data.experience.map((e) => (e.id === id ? { ...e, ...updates, id: e.id } : e));
  await saveData(data);
}

export async function deleteExperience(id: string): Promise<void> {
  const data = await loadData();
  data.experience = data.experience.filter((e) => e.id !== id);
  await saveData(data);
}

/**
 * Compress and resize image before storing
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (default: 1920px - Full HD)
 * @param maxHeight - Maximum height (default: 1920px)
 * @param quality - JPEG quality 0-1 (default: 0.85 - 85% quality)
 * @returns Compressed image as data URL
 * 
 * Note: localStorage has a browser limit of typically 5-10MB total.
 * Each image is limited to ~1MB compressed size to allow multiple images.
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800, // Aggressively reduced to 800px
  maxHeight: number = 800, // Aggressively reduced to 800px
  quality: number = 0.6 // Start with 60% quality for smaller files
): Promise<string> {
  console.log(`[compressImage] Starting compression for ${file.name}, max dimensions: ${maxWidth}x${maxHeight}, quality: ${quality}`);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;
        console.log(`[compressImage] Original image size: ${originalWidth}x${originalHeight}px, file size: ${(file.size / 1024).toFixed(2)} KB`);
        
        // Calculate new dimensions - be more aggressive
        let width = originalWidth;
        let height = originalHeight;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
          console.log(`Resizing to: ${width}x${height}px`);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { 
          willReadFrequently: false,
          alpha: false // No alpha channel for JPEG
        });
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Use better image smoothing for compression
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Always convert to JPEG for better compression (even PNGs)
        // Start with lower quality
        let currentQuality = quality;
        let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        
        // Target size: 400KB base64 (which is ~300KB actual file)
        const maxSize = 400000; // 400KB limit per image
        console.log(`Initial compressed size: ${(dataUrl.length / 1024).toFixed(2)} KB at quality ${currentQuality}`);
        
        // Aggressively compress until we hit target
        let attempts = 0;
        while (dataUrl.length > maxSize && attempts < 10) {
          if (attempts < 5) {
            // First 5 attempts: reduce quality
            currentQuality = Math.max(0.3, currentQuality * 0.7);
            dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
            console.log(`Quality reduction attempt ${attempts + 1}: ${(dataUrl.length / 1024).toFixed(2)} KB at quality ${currentQuality.toFixed(2)}`);
          } else {
            // Next attempts: reduce dimensions
            const ratio = 1 - (attempts - 4) * 0.15; // Reduce by 15% each time
            if (ratio < 0.3) break; // Don't go below 30% of original
            
            const newWidth = Math.floor(width * ratio);
            const newHeight = Math.floor(height * ratio);
            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            dataUrl = canvas.toDataURL('image/jpeg', 0.4);
            console.log(`Dimension reduction attempt ${attempts - 4}: ${(dataUrl.length / 1024).toFixed(2)} KB at ${newWidth}x${newHeight}px`);
          }
          attempts++;
        }
        
        console.log(`Final compressed size: ${(dataUrl.length / 1024).toFixed(2)} KB (target was ${(maxSize / 1024).toFixed(2)} KB)`);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function fileToDataUrl(file: File): Promise<string> {
  // Use compression for images to save localStorage space
  if (file.type.startsWith('image/')) {
    console.log(`[fileToDataUrl] Compressing image: ${file.name}, type: ${file.type}, size: ${(file.size / 1024).toFixed(2)} KB`);
    const result = await compressImage(file);
    console.log(`[fileToDataUrl] Compression complete, result size: ${(result.length / 1024).toFixed(2)} KB`);
    return result;
  }
  // For non-image files, use original method
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function getProfilePhoto(): Promise<string | undefined> {
  const data = await loadData();
  return data.profilePhoto;
}

export function getProfilePhotoSync(): string | undefined {
  const data = loadDataSync();
  return data.profilePhoto;
}

export async function setProfilePhoto(photoDataUrl: string): Promise<void> {
  try {
    // Try uploading to Firebase Storage if configured
    const { uploadProfilePhotoToFirebase } = await import("./firebaseStorage");
    const firebaseUrl = await uploadProfilePhotoToFirebase(photoDataUrl);
    const data = await loadData();
    data.profilePhoto = firebaseUrl;
    await saveData(data);
  } catch {
    // Fallback to data URL
    const data = await loadData();
    data.profilePhoto = photoDataUrl;
    await saveData(data);
  }
}

export async function getAboutContent(): Promise<AboutContent> {
  const data = await loadData();
  if (data.aboutContent) {
    // Clean up skills array - ensure it's valid
    const cleaned = { ...data.aboutContent };
    if (cleaned.skills) {
      if (Array.isArray(cleaned.skills)) {
        // Filter out invalid skills
        cleaned.skills = cleaned.skills
          .filter(skill => skill && typeof skill === 'string' && skill.trim().length > 0)
          .map(skill => skill.trim());
        // Remove if empty
        if (cleaned.skills.length === 0) {
          cleaned.skills = undefined;
        }
      } else {
        // If skills is not an array, remove it
        cleaned.skills = undefined;
      }
    }
    return cleaned;
  }
  // Return default content
  return {
    paragraph1: "My name is Adrian Tan. I'm currently studying an Associate Degree in Information Technology. I enjoy programming digital experiences that blend functionality with aesthetics.",
    paragraph2: "I'm an early-stage developer with basic knowledge of HTML, Java, CSS, TypeScript, JavaScript, React, and Python. I continue to grow my skills through personal projects and challenges.",
    paragraph3: "Aside from programming, my other hobbies include 3d Modelling, Gaming, Watching Anime, and Badminton",
    skills: ['Java', 'UI/UX Design', 'Problem Solving']
  };
}

export function getAboutContentSync(): AboutContent {
  const data = loadDataSync();
  if (data.aboutContent) {
    // Clean up skills array - ensure it's valid
    const cleaned = { ...data.aboutContent };
    if (cleaned.skills) {
      if (Array.isArray(cleaned.skills)) {
        // Filter out invalid skills
        cleaned.skills = cleaned.skills
          .filter(skill => skill && typeof skill === 'string' && skill.trim().length > 0)
          .map(skill => skill.trim());
        // Remove if empty
        if (cleaned.skills.length === 0) {
          cleaned.skills = undefined;
        }
      } else {
        // If skills is not an array, remove it
        cleaned.skills = undefined;
      }
    }
    return cleaned;
  }
  return {
    paragraph1: "My name is Adrian Tan. I'm currently studying an Associate Degree in Information Technology. I enjoy programming digital experiences that blend functionality with aesthetics.",
    paragraph2: "I'm an early-stage developer with basic knowledge of HTML, Java, CSS, TypeScript, JavaScript, React, and Python. I continue to grow my skills through personal projects and challenges.",
    paragraph3: "Aside from programming, my other hobbies include 3d Modelling, Gaming, Watching Anime, and Badminton",
    skills: ['Java', 'UI/UX Design', 'Problem Solving']
  };
}

export async function setAboutContent(content: AboutContent): Promise<void> {
  const data = await loadData();
  data.aboutContent = content;
  await saveData(data);
}

// Hero text functions
export async function getHeroText(): Promise<string> {
  const data = await loadData();
  return data.heroText || "Project showcase";
}

export function getHeroTextSync(): string {
  const data = loadDataSync();
  return data.heroText || "Project showcase";
}

export async function setHeroText(text: string): Promise<void> {
  const data = await loadData();
  data.heroText = text.trim() || undefined;
  await saveData(data);
}


