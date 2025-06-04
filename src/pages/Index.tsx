
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Github, Linkedin } from "lucide-react";
import MagicalBackground from "@/components/MagicalBackground";

const Index = () => {
  const projects = [
    {
      title: "Project One",
      description: "Add your project description here",
      tech: ["Tech", "Stack", "Here"],
      color: "from-slate-700 to-slate-800"
    },
    {
      title: "Project Two",
      description: "Add your project description here",
      tech: ["Tech", "Stack", "Here"],
      color: "from-slate-600 to-slate-700"
    },
    {
      title: "Project Three",
      description: "Add your project description here",
      tech: ["Tech", "Stack", "Here"],
      color: "from-slate-800 to-slate-900"
    }
  ];

  const skills = [
    { name: "JavaScript", level: 20 },
    { name: "React", level: 20 },
    { name: "TypeScript", level: 20 },
    { name: "Node.js", level: 15 },
    { name: "CSS/Tailwind", level: 30 },
    { name: "Python", level: 40 },
    { name: "UI/UX Design", level: 50 },
    { name: "Java", level: 60 }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      <MagicalBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-8">
        <div className="text-2xl font-bold bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
          Portfolio
        </div>
        
        <div className="flex gap-4">
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
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
          Featured Projects
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-slate-700/50"
            >
              <div className={`w-full h-36 bg-gradient-to-br ${project.color} rounded-xl mb-4 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors duration-300"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 bg-slate-400/30 rounded-full"></div>
                <div className="absolute top-3 left-3 w-4 h-4 bg-slate-300/40 rounded-full"></div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-200 mb-2">
                {project.title}
              </h3>
              
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
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
          Experience
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-200 font-medium">{skill.name}</span>
                  <span className="text-slate-400 text-sm">{skill.level}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-slate-500 to-slate-400 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
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
