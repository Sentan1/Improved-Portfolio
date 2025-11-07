import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addProject, fileToDataUrl, isAdmin } from "@/lib/storage";
import { uploadImageToFirebase } from "@/lib/firebaseStorage";

const AdminAddProject = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [tech, setTech] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string>("");

  if (!isAdmin()) {
    // simple guard to prevent accidental access
    navigate("/");
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImageFiles(files);
    setError("");
    
    // Create previews
    try {
      const previews = await Promise.all(
        files.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );
      setImagePreviews(previews);
    } catch (err) {
      setError("Failed to load image previews");
      console.error("Image preview error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Project name is required");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      let images: string[] | undefined;
      if (imageFiles.length > 0) {
        setCompressing(true);
        try {
          const slice = imageFiles.slice(0, 5);
          // Compress images first
          const compressedImages = await Promise.all(
            slice.map(async (f, index) => {
              try {
                console.log(`Compressing image ${index + 1}/${slice.length}: ${f.name}`);
                const compressed = await fileToDataUrl(f);
                const sizeKB = (compressed.length / 1024).toFixed(2);
                console.log(`Compressed ${f.name}: ${sizeKB} KB`);
                return compressed;
              } catch (err) {
                console.error("Error processing image:", f.name, err);
                throw new Error(`Failed to process image: ${f.name}`);
              }
            })
          );
          
          // Create project first to get ID, then upload images
          const tempProject = await addProject({
            title: title.trim(),
            description: description.trim(),
            category: category.trim() || undefined,
            filterCategory: filterCategory.trim() || undefined,
            tech: tech
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            images: undefined, // Will update after uploading
          });
          
          // Upload to Firebase Storage and get URLs
          console.log("Uploading images to Firebase Storage...");
          images = await Promise.all(
            compressedImages.map(async (dataUrl, index) => {
              try {
                const storageUrl = await uploadImageToFirebase(dataUrl, tempProject.id, index);
                console.log(`Uploaded image ${index + 1} to Storage: ${storageUrl.substring(0, 50)}...`);
                return storageUrl;
              } catch (err) {
                console.error("Error uploading to Storage, using data URL:", err);
                // Fallback to data URL if Storage fails
                return dataUrl;
              }
            })
          );
          
          // Update project with image URLs
          const { updateProject } = await import("@/lib/storage");
          await updateProject(tempProject.id, { images });
          
          setCompressing(false);
        } catch (err) {
          setCompressing(false);
          setError(err instanceof Error ? err.message : "Failed to process images");
          setSubmitting(false);
          return;
        }
      } else {
        // No images, just create the project
        await addProject({
          title: title.trim(),
          description: description.trim(),
          category: category.trim() || undefined,
          filterCategory: filterCategory.trim() || undefined,
          tech: tech
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          images: undefined,
        });
      }
      
      // Reload to get the final project
      const { loadData } = await import("@/lib/storage");
      const verifyData = await loadData();
      const newProject = verifyData.projects[0]; // Most recently added
      
      // Verify project was saved
      console.log('Project saved:', newProject);
      console.log('Projects in storage after save:', verifyData.projects.length);
      
      // Dispatch custom event to trigger refresh on home page
      window.dispatchEvent(new CustomEvent('portfolio-data-updated', { detail: { projectId: newProject.id } }));
      
      // Small delay to ensure everything is saved
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Navigate back - the location change will trigger refresh
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error saving project:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save project";
      if (errorMessage.includes("quota") || errorMessage.includes("QuotaExceeded")) {
        setError("Storage limit exceeded. Please use smaller images or remove some projects. Images are automatically compressed, but you may have too many large images.");
      } else {
        setError(errorMessage);
      }
      setSubmitting(false);
      setCompressing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 bg-slate-900/70"></div>
      <div className="relative z-10 container mx-auto px-6 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-200 bg-clip-text text-transparent mb-8">
          Add Project
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/90 p-6 rounded-xl border border-slate-700/50">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-200">Project name</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-slate-700/50 border-slate-600 text-slate-100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-200">Project description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required className="bg-slate-700/50 border-slate-600 text-slate-100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-200">Category (e.g., React, Native, 3D Modelling)</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="React" className="bg-slate-700/50 border-slate-600 text-slate-100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-category" className="text-slate-200">Filter Category (e.g., Web, Mobile, Game, Design)</Label>
            <Input id="filter-category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} placeholder="Web" className="bg-slate-700/50 border-slate-600 text-slate-100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tech" className="text-slate-200">General tags (comma-separated)</Label>
            <Input id="tech" value={tech} onChange={(e) => setTech(e.target.value)} placeholder="Tech, Stack, Here" className="bg-slate-700/50 border-slate-600 text-slate-100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="images" className="text-slate-200">Project images (PNG or JPG, up to 5)</Label>
            <Input 
              id="images" 
              type="file" 
              accept="image/png,image/jpeg,image/jpg" 
              multiple 
              onChange={handleImageChange}
              className="bg-slate-700/50 border-slate-600 text-slate-100 file:text-slate-200" 
            />
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative">
                    <img 
                      src={preview} 
                      alt={`Preview ${idx + 1}`} 
                      className="w-full h-24 object-cover rounded border border-slate-600"
                    />
                    <span className="absolute top-1 right-1 bg-slate-800/80 text-slate-200 text-xs px-1 rounded">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {imageFiles.length > 0 && (
              <p className="text-slate-400 text-sm">
                {imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}
          {compressing && (
            <div className="bg-blue-900/50 border border-blue-700 text-blue-200 px-4 py-2 rounded text-sm">
              Compressing images... This may take a moment.
            </div>
          )}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate("/")} disabled={submitting || compressing}>Cancel</Button>
            <Button type="submit" disabled={submitting || compressing}>
              {compressing ? "Compressing..." : submitting ? "Saving..." : "Save Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProject;


