
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

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
        <div className="flex-1 flex justify-center">
          <div className="relative">
            {/* Profile Frame */}
            <div className="relative w-72 h-72 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-full p-6 shadow-2xl border-8 border-slate-800">
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border-4 border-slate-600 overflow-hidden shadow-inner relative">
                {/* Profile Picture Placeholder */}
                <img 
                  src="/placeholder.svg" 
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
        </div>

        {/* About Content */}
        <div className="flex-1 max-w-2xl">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-200 bg-clip-text text-transparent mb-6">
              About Me
            </h1>
            
            <div className="space-y-5 text-slate-300 leading-relaxed">
              <p className="text-base">
                My Name is Adrian Tan. Im currently studying associates of information technology. I enjoy programming digital experiences that combine functionality with aethetics

              </p>
              
              <p className="text-sm">
               Im a early developer, i know the basics of HTML, JAVA, CSS, TYPESCRIPT, JAVASCRIPT, REACT and PYTHON. I continue to grow my knowledge and understanding through projects and challenges.
              </p>
              
              <p className="text-sm">
                Aside from programming, my other hobbies include 3d Modelling, Gaming, Watching Anime, and Badminton
              </p>
              
              <div className="pt-4">
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {['Frontend Development', 'React & TypeScript', 'UI/UX Design', 'Web Performance', 'Problem Solving'].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-slate-700 rounded-full text-slate-300 text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Character Elements */}
      <div className="absolute bottom-10 right-10 animate-bounce">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full border-2 border-slate-800 shadow-lg"></div>
      </div>
    </div>
  );
};

export default About;
