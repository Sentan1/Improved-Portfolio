
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { ArrowRight, Mail, Github, Linkedin, Plus, Pencil, Trash2, LogIn, LogOut, Image as ImageIcon } from "lucide-react";
import MagicalBackground from "@/components/MagicalBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { loadData, saveData, isAdmin as loadIsAdmin, setAdmin, deleteProject, updateProject, addExperience, updateExperience, deleteExperience, getHeroText, getHeroTextSync, setHeroText, fileToDataUrl, type Project, type Experience } from "@/lib/storage";
import { uploadImageToFirebase } from "@/lib/firebaseStorage";
import { login, logout, onAuthChange, isAuthenticated, getCurrentUser } from "@/lib/auth";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editFilterCategory, setEditFilterCategory] = useState("");
  const [editTech, setEditTech] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editCompressing, setEditCompressing] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [heroText, setHeroTextState] = useState<string>(getHeroTextSync());
  const [editHeroTextOpen, setEditHeroTextOpen] = useState(false);
  const [editHeroTextValue, setEditHeroTextValue] = useState("");

  const isRefreshingRef = useRef(false);
  const refresh = useCallback(async () => {
    if (isRefreshingRef.current) return; // Prevent concurrent refreshes
    isRefreshingRef.current = true;
    try {
      const data = await loadData();
      console.log('Refreshing data, projects count:', data.projects.length);
      setProjects([...data.projects]); // Create new array to force re-render
      setExperience([...data.experience]); // Create new array to force re-render
      const text = await getHeroText();
      setHeroTextState(text);
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Get unique filter categories from projects
  const filterCategories = useMemo(() => {
    const categories = new Set<string>();
    projects.forEach(p => {
      if (p.filterCategory) {
        categories.add(p.filterCategory);
      }
    });
    return Array.from(categories).sort();
  }, [projects]);

  // Filter projects based on selected filter
  const filteredProjects = useMemo(() => {
    if (selectedFilter === "all") {
      return projects;
    }
    return projects.filter(p => p.filterCategory === selectedFilter);
  }, [projects, selectedFilter]);

  useEffect(() => {
    const loadHeroText = async () => {
      const text = await getHeroText();
      setHeroTextState(text);
    };
    loadHeroText();
    refresh();
    
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setIsAdmin(true);
        setAdmin(true);
      } else {
        setIsAdmin(false);
        setAdmin(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Refresh when location changes (e.g., returning from add project page)
  const prevLocationRef = useRef<string>(location.pathname + location.hash);
  useEffect(() => {
    const currentLocation = location.pathname + location.hash;
    // Only refresh if location actually changed (not just on mount)
    if (currentLocation !== prevLocationRef.current) {
      prevLocationRef.current = currentLocation;
      // Add a small delay to ensure data is updated
      const timer = setTimeout(() => {
        refresh();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash, refresh]);
  
  // Also listen for storage changes (in case data is updated in another tab/window)
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout;
    
    const handleStorageChange = () => {
      // Debounce storage changes
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        refresh();
      }, 300);
    };
    const handleDataUpdate = () => {
      // Debounce custom events
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        refresh();
      }, 100);
    };
    const handleVisibilityChange = () => {
      // Only refresh when page becomes visible (e.g., navigating back)
      if (document.visibilityState === 'visible') {
        clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(() => {
          refresh();
        }, 200);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('portfolio-data-updated', handleDataUpdate);
    window.addEventListener('focus', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearTimeout(refreshTimeout);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('portfolio-data-updated', handleDataUpdate);
      window.removeEventListener('focus', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refresh]);

  const handleLogin = async () => {
    if (!adminEmail || !adminPassword) {
      setLoginError("Please enter both email and password");
      return;
    }
    
    setLoggingIn(true);
    setLoginError("");
    
    try {
      // Use Firebase Authentication - password is stored server-side, not in code!
      await login(adminEmail, adminPassword);
      setAdminEmail("");
      setAdminPassword("");
      setAuthOpen(false);
    } catch (error: any) {
      console.error("Login failed:", error);
      setLoginError(error.message || "Invalid email or password");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setAdmin(false);
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      <MagicalBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-8">
        <div className="text-2xl font-bold bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
          Portfolio
        </div>
        
        <div className="flex gap-3 items-center">
          {isAdmin ? (
            <>
              <Button onClick={() => navigate("/admin/add-project")} className="bg-slate-700 hover:bg-slate-600">
                <Plus className="w-4 h-4 mr-2" /> Add Project
              </Button>
              <Button variant="secondary" onClick={handleLogout} className="bg-slate-800/80">
                <LogOut className="w-4 h-4 mr-2" /> Exit Admin
              </Button>
            </>
          ) : (
            <Button onClick={() => setAuthOpen(true)} className="bg-slate-700 hover:bg-slate-600">
              <LogIn className="w-4 h-4 mr-2" /> Admin
            </Button>
          )}
          <Link 
            to="/about" 
            className="px-6 py-2 bg-slate-800/80 backdrop-blur-sm rounded-full text-slate-200 hover:bg-slate-700/80 transition-all duration-300 hover:scale-105 shadow-lg border border-slate-600/50"
          >
            About Me
          </Link>
          <Link 
            to="/contact" 
            className="px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-slate-200 rounded-full hover:from-slate-600 hover:to-slate-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Contact
          </Link>
        </div>
      </nav>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input 
                id="admin-email" 
                type="email" 
                value={adminEmail} 
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="your-email@example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-pass">Password</Label>
              <Input 
                id="admin-pass" 
                type="password" 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {loginError && (
              <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                {loginError}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleLogin} disabled={loggingIn}>
                {loggingIn ? "Logging in..." : "Login"}
              </Button>
              <Button variant="secondary" onClick={() => setAuthOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 bg-clip-text text-transparent leading-tight">
            Adrian Tan
            <br />
            <span className="text-3xl md:text-4xl text-slate-400">Information Technology</span>
          </h1>
          
          <div className="relative mb-10 group">
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {heroText}
            </p>
            {isAdmin && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute -top-2 right-0 opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => {
                  setEditHeroTextValue(heroText);
                  setEditHeroTextOpen(true);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <Link 
            to="/about"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-slate-200 rounded-full text-lg font-medium hover:from-slate-600 hover:to-slate-700 transition-all duration-300 hover:scale-105 shadow-xl group"
          >
            Learn More About Me
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Projects Section */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
          Featured Projects
        </h2>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-6xl mx-auto">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            onClick={() => setSelectedFilter("all")}
            className={selectedFilter === "all" 
              ? "bg-slate-700 hover:bg-slate-600 text-slate-100" 
              : "bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
            }
          >
            All Projects
          </Button>
          {filterCategories.map((cat) => (
            <Button
              key={cat}
              variant={selectedFilter === cat ? "default" : "outline"}
              onClick={() => setSelectedFilter(cat)}
              className={selectedFilter === cat
                ? "bg-slate-700 hover:bg-slate-600 text-slate-100"
                : "bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
              }
            >
              {cat}
            </Button>
          ))}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400 text-lg">No projects found in this category.</p>
            </div>
          ) : (
            filteredProjects.map((project, index) => {
              const ProjectCard = ({ project, delay = 0 }: { project: Project; delay?: number }) => {
                const { ref, isVisible } = useScrollAnimation();
                
                return (
                  <div 
                    ref={ref}
                    key={project.id}
                    className={`group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-700 border border-slate-700/50 cursor-pointer hover:scale-105 ${
                      isVisible 
                        ? "opacity-100 translate-y-0" 
                        : "opacity-0 translate-y-10"
                    }`}
                    style={{
                      transitionDelay: isVisible ? `${delay}ms` : "0ms"
                    }}
                    onClick={() => {
                      setSelectedProject(project);
                      setProjectModalOpen(true);
                    }}
                  >
              <div className={`w-full h-36 bg-gradient-to-br ${project.color || "from-slate-700 to-slate-800"} rounded-xl mb-4 relative overflow-hidden flex items-center justify-center`}>
                {project.images && project.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center gap-2 text-slate-300/70">
                    <ImageIcon className="w-5 h-5" />
                    No image
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors duration-300"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 bg-slate-400/30 rounded-full"></div>
                <div className="absolute top-3 left-3 w-4 h-4 bg-slate-300/40 rounded-full"></div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-slate-200">
                {project.title}
              </h3>
                {project.category && (
                  <span className="px-2 py-1 bg-slate-600 text-slate-200 rounded-full text-xs font-medium">
                    {project.category}
                  </span>
                )}
              </div>
              
              <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span 
                    key={tech}
                    className="px-2 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {isAdmin && (
                <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="secondary" onClick={() => {
                    setEditingProject(project);
                    setEditTitle(project.title);
                    setEditDescription(project.description);
                    setEditCategory(project.category || "");
                    setEditFilterCategory(project.filterCategory || "");
                    setEditTech(project.tech && Array.isArray(project.tech) ? project.tech.join(", ") : "");
                    setEditExistingImages(project.images || []);
                    setEditImageFiles([]);
                    setEditImagePreviews([]);
                    setEditProjectOpen(true);
                  }}>
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    if (confirm("Delete this project?")) {
                      await deleteProject(project.id);
                      refresh();
                    }
                  }}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              )}
                  </div>
                );
              };

              return <ProjectCard key={project.id} project={project} delay={index * 100} />;
            })
          )}
        </div>
      </section>

      <Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.title}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-3">
              {selectedProject.images && selectedProject.images.length > 0 && (
                <div className="relative">
                  {selectedProject.images.length > 1 ? (
                    <Carousel className="w-full">
                      <CarouselContent>
                        {selectedProject.images.slice(0, 5).map((src, idx) => (
                          <CarouselItem key={idx}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={`${selectedProject.title} ${idx + 1}`} className="w-full h-56 object-cover rounded" />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="-left-3" />
                      <CarouselNext className="-right-3" />
                    </Carousel>
                  ) : (
                    <div className="w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedProject.images[0]} alt={selectedProject.title} className="w-full h-56 object-cover rounded" />
                    </div>
                  )}
                </div>
              )}
              {selectedProject.category && (
                <div className="mb-2">
                  <span className="px-3 py-1 bg-slate-600 text-slate-200 rounded-full text-sm font-medium">
                    {selectedProject.category}
                  </span>
                </div>
              )}
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{selectedProject.description}</p>
              {selectedProject.tech.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((t) => (
                    <span key={t} className="px-2 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-medium">{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editProjectOpen} onOpenChange={setEditProjectOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-slate-200">Project name</Label>
                <Input 
                  id="edit-title" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  className="bg-slate-700/50 border-slate-600 text-slate-100" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-slate-200">Project description</Label>
                <Textarea 
                  id="edit-description" 
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)} 
                  rows={5}
                  className="bg-slate-700/50 border-slate-600 text-slate-100" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-slate-200">Category (e.g., React, Native, 3D Modelling)</Label>
                <Input 
                  id="edit-category" 
                  value={editCategory} 
                  onChange={(e) => setEditCategory(e.target.value)} 
                  placeholder="React"
                  className="bg-slate-700/50 border-slate-600 text-slate-100" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-filter-category" className="text-slate-200">Filter Category (e.g., Web, Mobile, Game, Design)</Label>
                <Input 
                  id="edit-filter-category" 
                  value={editFilterCategory} 
                  onChange={(e) => setEditFilterCategory(e.target.value)} 
                  placeholder="Web"
                  className="bg-slate-700/50 border-slate-600 text-slate-100" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tech" className="text-slate-200">General tags (comma-separated)</Label>
                <Input 
                  id="edit-tech" 
                  value={editTech} 
                  onChange={(e) => setEditTech(e.target.value)} 
                  placeholder="Tech, Stack, Here"
                  className="bg-slate-700/50 border-slate-600 text-slate-100" 
                />
              </div>

              {/* Image Management Section */}
              <div className="space-y-3 pt-2 border-t border-slate-700">
                <Label className="text-slate-200">Project Images</Label>
                
                {/* Existing Images */}
                {editExistingImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Current Images ({editExistingImages.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {editExistingImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={imgUrl} 
                            alt={`Existing ${idx + 1}`}
                            className="w-full h-24 object-cover rounded border border-slate-600"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            onClick={() => {
                              setEditExistingImages(editExistingImages.filter((_, i) => i !== idx));
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Images */}
                <div className="space-y-2">
                  <Label htmlFor="edit-images" className="text-slate-200">Add New Images (PNG or JPG, up to 5)</Label>
                  <Input 
                    id="edit-images" 
                    type="file" 
                    accept="image/png,image/jpeg,image/jpg" 
                    multiple 
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []).slice(0, 5);
                      setEditImageFiles(files);
                      
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
                        setEditImagePreviews(previews);
                      } catch (err) {
                        console.error("Image preview error:", err);
                      }
                    }}
                    className="bg-slate-700/50 border-slate-600 text-slate-100 file:text-slate-200" 
                  />
                  {editImagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {editImagePreviews.map((preview, idx) => (
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
                </div>
              </div>

              {editCompressing && (
                <div className="bg-blue-900/50 border border-blue-700 text-blue-200 px-4 py-2 rounded text-sm">
                  Compressing images... This may take a moment.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => {
                  setEditProjectOpen(false);
                  setEditImageFiles([]);
                  setEditImagePreviews([]);
                }} disabled={editSaving || editCompressing}>Cancel</Button>
                <Button onClick={async () => {
                  setEditSaving(true);
                  try {
                    let finalImages = [...editExistingImages];
                    
                    // Upload new images if any
                    if (editImageFiles.length > 0) {
                      setEditCompressing(true);
                      try {
                        const compressedImages = await Promise.all(
                          editImageFiles.map(async (f) => {
                            const compressed = await fileToDataUrl(f);
                            if (compressed.length > 500000) {
                              throw new Error(`Image ${f.name} is too large after compression. Maximum allowed is 500KB.`);
                            }
                            return compressed;
                          })
                        );
                        
                        const projectId = editingProject.id;
                        const uploadedUrls = await Promise.all(
                          compressedImages.map(async (dataUrl, index) => {
                            const storageUrl = await uploadImageToFirebase(dataUrl, projectId, editExistingImages.length + index);
                            return storageUrl;
                          })
                        );
                        
                        finalImages = [...editExistingImages, ...uploadedUrls];
                        setEditCompressing(false);
                      } catch (err) {
                        setEditCompressing(false);
                        setEditSaving(false);
                        alert(err instanceof Error ? err.message : "Failed to process images");
                        return;
                      }
                    }
                    
                    await updateProject(editingProject.id, {
                      title: editTitle.trim(),
                      description: editDescription.trim(),
                      category: editCategory.trim() || undefined,
                      filterCategory: editFilterCategory.trim() || undefined,
                      tech: editTech.split(",").map((t) => t.trim()).filter(Boolean),
                      images: finalImages.length > 0 ? finalImages : undefined,
                    });
                    refresh();
                    setEditProjectOpen(false);
                    setEditImageFiles([]);
                    setEditImagePreviews([]);
                  } catch (err) {
                    console.error("Error updating project:", err);
                    alert("Failed to update project");
                  } finally {
                    setEditSaving(false);
                  }
                }} disabled={editSaving || editCompressing}>
                  {editCompressing ? "Compressing..." : editSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Hero Text Dialog */}
      <Dialog open={editHeroTextOpen} onOpenChange={setEditHeroTextOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hero Text</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="hero-text" className="text-slate-200">Hero Text</Label>
              <Input
                id="hero-text"
                value={editHeroTextValue}
                onChange={(e) => setEditHeroTextValue(e.target.value)}
                placeholder="Project showcase"
                className="bg-slate-700/50 border-slate-600 text-slate-100"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setEditHeroTextOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                await setHeroText(editHeroTextValue);
                setHeroTextState(editHeroTextValue);
                setEditHeroTextOpen(false);
              }}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Experience Section */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
          Experience
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {experience.map((exp) => (
              <div key={exp.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-200 font-medium">{exp.name}</span>
                  <span className="text-slate-400 text-sm">{exp.level}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-slate-500 to-slate-400 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${exp.level}%` }}
                  ></div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="secondary" onClick={async () => {
                      const newName = prompt("Edit experience name", exp.name) || exp.name;
                      const raw = prompt("Set percentage (0-100)", String(exp.level));
                      const num = Math.max(0, Math.min(100, Number(raw)));
                      await updateExperience(exp.id, { name: newName, level: isNaN(num) ? exp.level : num });
                      refresh();
                    }}>
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={async () => {
                      if (confirm("Delete this experience?")) {
                        await deleteExperience(exp.id);
                        refresh();
                      }
                    }}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {isAdmin && (
            <div className="mt-6 flex gap-3">
              <Button onClick={async () => {
                const name = prompt("New experience name");
                if (!name) return;
                const raw = prompt("Percentage (0-100)", "50");
                const num = Math.max(0, Math.min(100, Number(raw)));
                await addExperience({ name, level: isNaN(num) ? 50 : num });
                refresh();
              }}>
                <Plus className="w-4 h-4 mr-2" /> Add Experience
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-10">
        <div className="text-center max-w-md mx-auto">
          <div className="flex justify-center gap-4 mb-6">
            <Link 
              to="/contact"
              className="p-3 bg-slate-800/60 backdrop-blur-sm rounded-full text-slate-300 hover:bg-slate-700/60 transition-all duration-300 hover:scale-110 shadow-lg border border-slate-600/50"
            >
              <Mail className="w-5 h-5" />
            </Link>
            <a 
              href="https://github.com/Sentan1"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-800/60 backdrop-blur-sm rounded-full text-slate-300 hover:bg-slate-700/60 transition-all duration-300 hover:scale-110 shadow-lg border border-slate-600/50"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="https://www.linkedin.com/in/adrian-tan12"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-800/60 backdrop-blur-sm rounded-full text-slate-300 hover:bg-slate-700/60 transition-all duration-300 hover:scale-110 shadow-lg border border-slate-600/50"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
          
          <p className="text-slate-400 text-sm">
            Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
