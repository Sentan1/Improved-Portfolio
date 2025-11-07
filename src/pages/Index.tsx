
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Mail, Github, Linkedin, Plus, Pencil, Trash2, LogIn, LogOut, Image as ImageIcon } from "lucide-react";
import MagicalBackground from "@/components/MagicalBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { loadData, saveData, isAdmin as loadIsAdmin, setAdmin, deleteProject, updateProject, addExperience, updateExperience, deleteExperience, type Project, type Experience } from "@/lib/storage";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(loadIsAdmin());
  const [authOpen, setAuthOpen] = useState(false);
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

  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);

  const refresh = async () => {
    const data = await loadData();
    console.log('Refreshing data, projects count:', data.projects.length);
    setProjects([...data.projects]); // Create new array to force re-render
    setExperience([...data.experience]); // Create new array to force re-render
  };

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
    refresh();
  }, []);

  // Refresh when location changes (e.g., returning from add project page)
  useEffect(() => {
    // Add a small delay to ensure data is updated
    const timer = setTimeout(() => {
      refresh();
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);
  
  // Also listen for storage changes (in case data is updated in another tab/window)
  useEffect(() => {
    const handleStorageChange = () => {
      refresh();
    };
    const handleDataUpdate = () => {
      // Force immediate refresh when custom event fires
      setTimeout(() => {
        refresh();
      }, 10);
    };
    const handleVisibilityChange = () => {
      // Refresh when page becomes visible (e.g., navigating back)
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('portfolio-data-updated', handleDataUpdate);
    window.addEventListener('focus', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('portfolio-data-updated', handleDataUpdate);
      window.removeEventListener('focus', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleLogin = () => {
    // Password is stored in environment variable (still visible in build, but better than hardcoding)
    // For production, this should use Firebase Authentication instead
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || "Huh???2006";
    
    if (adminPassword === correctPassword) {
      setAdmin(true);
      setIsAdmin(true);
      setAdminPassword("");
      setAuthOpen(false);
    } else {
      alert("Incorrect password");
    }
  };

  const handleLogout = () => {
    setAdmin(false);
    setIsAdmin(false);
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
            <DialogTitle>Enter admin password or continue as guest</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="admin-pass">Password</Label>
            <Input id="admin-pass" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
            <div className="flex gap-3 pt-2">
              <Button onClick={handleLogin}>Unlock Admin</Button>
              <Button variant="secondary" onClick={() => setAuthOpen(false)}>View as Guest</Button>
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
          
          <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Welcome to my portfolio showcasing programming projects.
          </p>
          
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
            filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-slate-700/50 cursor-pointer"
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
                    setEditTech(project.tech.join(", "));
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
            ))
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
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
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setEditProjectOpen(false)}>Cancel</Button>
                <Button onClick={async () => {
                  await updateProject(editingProject.id, {
                    title: editTitle.trim(),
                    description: editDescription.trim(),
                    category: editCategory.trim() || undefined,
                    filterCategory: editFilterCategory.trim() || undefined,
                    tech: editTech.split(",").map((t) => t.trim()).filter(Boolean),
                  });
                  refresh();
                  setEditProjectOpen(false);
                }}>Save Changes</Button>
              </div>
            </div>
          )}
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
