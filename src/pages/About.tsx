
import { ArrowLeft, Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getProfilePhoto, getProfilePhotoSync, setProfilePhoto, fileToDataUrl, isAdmin, getAboutContent, getAboutContentSync, setAboutContent, type AboutContent } from "@/lib/storage";

const About = () => {
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhotoState] = useState<string | undefined>(getProfilePhotoSync());
  const [isAdminMode, setIsAdminMode] = useState(isAdmin());
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aboutContent, setAboutContentState] = useState<AboutContent>(getAboutContentSync());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPara1, setEditPara1] = useState("");
  const [editPara2, setEditPara2] = useState("");
  const [editPara3, setEditPara3] = useState("");
  const [editSkills, setEditSkills] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const photo = await getProfilePhoto();
      const content = await getAboutContent();
      setProfilePhotoState(photo);
      setAboutContentState(content);
    };
    loadData();
    setIsAdminMode(isAdmin());
  }, []);

  const handleEditAbout = () => {
    setEditPara1(aboutContent.paragraph1 || "");
    setEditPara2(aboutContent.paragraph2 || "");
    setEditPara3(aboutContent.paragraph3 || "");
    setEditSkills((aboutContent.skills || []).join(", "));
    setEditDialogOpen(true);
  };

  const handleSaveAbout = async () => {
    const updated: AboutContent = {
      paragraph1: editPara1.trim(),
      paragraph2: editPara2.trim(),
      paragraph3: editPara3.trim(),
      skills: editSkills.split(",").map(s => s.trim()).filter(Boolean),
    };
    await setAboutContent(updated);
    setAboutContentState(updated);
    setEditDialogOpen(false);
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setUploading(true);
    try {
      // Use compression for profile photo too
      const dataUrl = await fileToDataUrl(photoFile);
      setProfilePhoto(dataUrl);
      setProfilePhotoState(dataUrl);
      setPhotoFile(null);
      // Reset file input
      const fileInput = document.getElementById('profile-photo-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Photo upload error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload photo';
      if (errorMsg.includes('quota')) {
        alert('Storage limit exceeded. Please use a smaller image.');
      } else {
        alert(`Failed to upload photo: ${errorMsg}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleBackToPortfolio = () => {
    console.log('Navigating to home page');
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-slate-900"
      style={{
        backgroundImage: `url('${import.meta.env.BASE_URL}Image/Background.png')`,


        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-slate-900/60"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-6 h-6 bg-slate-400 rounded-full animate-bounce opacity-40"></div>
      <div className="absolute top-40 right-20 w-4 h-4 bg-slate-300 rounded-full animate-pulse opacity-30"></div>
      <div className="absolute bottom-20 left-20 w-8 h-8 bg-slate-500 rounded-full animate-bounce opacity-25"></div>
      <div className="absolute bottom-40 right-10 w-3 h-3 bg-slate-400 rounded-full animate-pulse opacity-35"></div>

      {/* Navigation */}
      <nav className="absolute top-8 left-8 z-50">
        <button 
          onClick={handleBackToPortfolio}
          className="flex items-center gap-2 text-slate-200 hover:text-slate-100 transition-colors group bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-600/50 cursor-pointer relative"
          style={{ pointerEvents: 'auto' }}
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Portfolio</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
        {/* Profile Section */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="relative">
            {/* Profile Frame */}
            <div className="relative w-72 h-72 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-full p-6 shadow-2xl border-8 border-slate-800">
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border-4 border-slate-600 overflow-hidden shadow-inner relative">
                {/* Profile Picture */}
                <img 
                  src={profilePhoto || "/placeholder.svg"} 
                  alt="Profile Picture" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                />
                {/* Decorative elements on frame */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-slate-500 rounded-full border-2 border-slate-800 shadow-lg"></div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-slate-600 rounded-full border-2 border-slate-800 shadow-lg"></div>
                <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-slate-400 rounded-full border-2 border-slate-800 shadow-lg"></div>
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-slate-500 rounded-full border-2 border-slate-800 shadow-lg"></div>
              </div>
              {/* Animated sparkles around frame */}
              <div className="absolute -top-8 -left-8 w-3 h-3 bg-slate-400 rounded-full animate-ping opacity-40"></div>
              <div className="absolute -top-6 -right-6 w-2 h-2 bg-slate-300 rounded-full animate-pulse opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-2 h-2 bg-slate-500 rounded-full animate-ping opacity-30"></div>
              <div className="absolute -bottom-8 -right-8 w-3 h-3 bg-slate-400 rounded-full animate-pulse opacity-35"></div>
            </div>
          </div>
          {isAdminMode && (
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 max-w-xs w-full">
              <Label htmlFor="profile-photo-input" className="text-slate-200 mb-2 block">Edit Profile Photo</Label>
              <Input 
                id="profile-photo-input"
                type="file" 
                accept="image/png" 
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="bg-slate-700/50 border-slate-600 text-slate-100 file:text-slate-200 mb-2"
              />
              {photoFile && (
                <Button 
                  onClick={handlePhotoUpload} 
                  disabled={uploading}
                  className="w-full bg-slate-700 hover:bg-slate-600"
                >
                  {uploading ? "Uploading..." : "Upload Photo"}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* About Content */}
        <div className="flex-1 max-w-2xl">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50 relative">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-200 bg-clip-text text-transparent">
                About Me
              </h1>
              {isAdminMode && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={handleEditAbout}
                  className="bg-slate-700 hover:bg-slate-600"
                >
                  <Pencil className="w-4 h-4 mr-2" /> Edit
                </Button>
              )}
            </div>
            
            <div className="space-y-5 text-slate-300 leading-relaxed">
              {aboutContent.paragraph1 && (
                <p className="text-base whitespace-pre-wrap">
                  {aboutContent.paragraph1}
                </p>
              )}
              
              {aboutContent.paragraph2 && (
                <p className="text-sm whitespace-pre-wrap">
                  {aboutContent.paragraph2}
                </p>
              )}
              
              {aboutContent.paragraph3 && (
                <p className="text-sm whitespace-pre-wrap">
                  {aboutContent.paragraph3}
                </p>
              )}
              
              {aboutContent.skills && aboutContent.skills.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-lg font-semibold text-slate-200 mb-3">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {aboutContent.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-700 rounded-full text-slate-300 text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit About Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit About Me</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="para1" className="text-slate-200">First Paragraph</Label>
                <Textarea 
                  id="para1"
                  value={editPara1} 
                  onChange={(e) => setEditPara1(e.target.value)} 
                  rows={3}
                  className="bg-slate-700/50 border-slate-600 text-slate-100" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="para2" className="text-slate-200">Second Paragraph</Label>
                <Textarea 
                  id="para2"
                  value={editPara2} 
                  onChange={(e) => setEditPara2(e.target.value)} 
                  rows={3}
                  className="bg-slate-700/50 border-slate-600 text-slate-100" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="para3" className="text-slate-200">Third Paragraph</Label>
                <Textarea 
                  id="para3"
                  value={editPara3} 
                  onChange={(e) => setEditPara3(e.target.value)} 
                  rows={2}
                  className="bg-slate-700/50 border-slate-600 text-slate-100" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-slate-200">Skills (comma-separated)</Label>
                <Input 
                  id="skills"
                  value={editSkills} 
                  onChange={(e) => setEditSkills(e.target.value)} 
                  placeholder="Java, UI/UX Design, Problem Solving"
                  className="bg-slate-700/50 border-slate-600 text-slate-100" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveAbout}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Floating Character Elements */}
      <div className="absolute bottom-10 right-10 animate-bounce">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full border-2 border-slate-800 shadow-lg"></div>
      </div>
    </div>
  );
};

export default About;
