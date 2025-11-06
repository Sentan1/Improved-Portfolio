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

export function loadData(): PortfolioData {
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
    return parsed;
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: PortfolioData): void {
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
  try {
    return localStorage.getItem(ADMIN_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAdmin(enabled: boolean): void {
  localStorage.setItem(ADMIN_KEY, enabled ? "true" : "false");
}

export function addProject(project: Omit<Project, "id">): Project {
  const data = loadData();
  const newProject: Project = { id: generateId("proj"), ...project };
  data.projects.unshift(newProject);
  saveData(data);
  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>): void {
  const data = loadData();
  data.projects = data.projects.map((p) => (p.id === id ? { ...p, ...updates, id: p.id } : p));
  saveData(data);
}

export function deleteProject(id: string): void {
  const data = loadData();
  data.projects = data.projects.filter((p) => p.id !== id);
  saveData(data);
}

export function addExperience(exp: Omit<Experience, "id">): Experience {
  const data = loadData();
  const newExp: Experience = { id: generateId("exp"), ...exp };
  data.experience.push(newExp);
  saveData(data);
  return newExp;
}

export function updateExperience(id: string, updates: Partial<Experience>): void {
  const data = loadData();
  data.experience = data.experience.map((e) => (e.id === id ? { ...e, ...updates, id: e.id } : e));
  saveData(data);
}

export function deleteExperience(id: string): void {
  const data = loadData();
  data.experience = data.experience.filter((e) => e.id !== id);
  saveData(data);
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
  maxWidth: number = 1920, // Increased to 1920px (Full HD width)
  maxHeight: number = 1920, // Increased to 1920px
  quality: number = 0.85 // Increased to 85% quality
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL with compression
        // For PNG, we'll keep it as PNG (to preserve transparency) but resize more aggressively
        // For JPEG, use quality compression
        const isPNG = file.type === 'image/png';
        const outputMimeType = isPNG ? 'image/png' : (file.type || 'image/jpeg');
        const dataUrl = canvas.toDataURL(outputMimeType, isPNG ? undefined : quality);
        
        // Check if compressed size is reasonable (less than 1MB base64 - allows larger images)
        // Note: localStorage typically has 5-10MB total limit, so be mindful of total storage
        if (dataUrl.length > 1000000) { // 1MB limit per image
          // Try with lower quality or smaller dimensions
          let finalUrl = dataUrl;
          let currentQuality = quality;
          let currentWidth = width;
          let currentHeight = height;
          
          // Try reducing quality first (only for JPEG)
          if (!isPNG) {
            for (let i = 0; i < 2 && finalUrl.length > 1000000; i++) {
              currentQuality = currentQuality * 0.85; // Gentle reduction
              finalUrl = canvas.toDataURL(outputMimeType, currentQuality);
            }
          }
          
          // If still too large, reduce dimensions (works for both PNG and JPEG)
          if (finalUrl.length > 1000000) {
            const smallerRatio = 0.8; // Less aggressive reduction
            currentWidth = width * smallerRatio;
            currentHeight = height * smallerRatio;
            canvas.width = currentWidth;
            canvas.height = currentHeight;
            ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
            finalUrl = canvas.toDataURL(outputMimeType, isPNG ? undefined : 0.75); // Higher quality fallback
          }
          
          resolve(finalUrl);
        } else {
          resolve(dataUrl);
        }
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
    return compressImage(file);
  }
  // For non-image files, use original method
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getProfilePhoto(): string | undefined {
  const data = loadData();
  return data.profilePhoto;
}

export function setProfilePhoto(photoDataUrl: string): void {
  const data = loadData();
  data.profilePhoto = photoDataUrl;
  saveData(data);
}

export function getAboutContent(): AboutContent {
  const data = loadData();
  if (data.aboutContent) {
    return data.aboutContent;
  }
  // Return default content
  return {
    paragraph1: "My name is Adrian Tan. I'm currently studying an Associate Degree in Information Technology. I enjoy programming digital experiences that blend functionality with aesthetics.",
    paragraph2: "I'm an early-stage developer with basic knowledge of HTML, Java, CSS, TypeScript, JavaScript, React, and Python. I continue to grow my skills through personal projects and challenges.",
    paragraph3: "Aside from programming, my other hobbies include 3d Modelling, Gaming, Watching Anime, and Badminton",
    skills: ['Java', 'UI/UX Design', 'Problem Solving']
  };
}

export function setAboutContent(content: AboutContent): void {
  const data = loadData();
  data.aboutContent = content;
  saveData(data);
}


