
const MagicalBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Main Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}Image/Background.png')`,

        }}
      >
        {/* Dark overlay to match the theme */}
        <div className="absolute inset-0 bg-slate-900/70"></div>
      </div>
      
      {/* Animated particles with various sizes and speeds */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-slate-400 rounded-full animate-ping opacity-30"></div>
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-slate-300 rounded-full animate-pulse opacity-40"></div>
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-slate-500 rounded-full animate-bounce opacity-20"></div>
      <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-slate-400 rounded-full animate-ping opacity-30"></div>
      <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-slate-300 rounded-full animate-pulse opacity-50"></div>
      <div className="absolute top-3/4 right-1/6 w-2 h-2 bg-slate-500 rounded-full animate-bounce opacity-25"></div>
      
      {/* Additional floating particles */}
      <div className="absolute top-10 left-10 w-1 h-1 bg-slate-400 rounded-full animate-ping opacity-40 animate-float"></div>
      <div className="absolute top-20 right-40 w-2 h-2 bg-slate-300 rounded-full animate-pulse opacity-30"></div>
      <div className="absolute bottom-40 left-40 w-1 h-1 bg-slate-500 rounded-full animate-bounce opacity-35"></div>
      <div className="absolute bottom-20 right-20 w-3 h-3 bg-slate-400 rounded-full animate-ping opacity-20"></div>
      <div className="absolute top-40 left-1/2 w-1 h-1 bg-slate-300 rounded-full animate-pulse opacity-45"></div>
      <div className="absolute bottom-60 right-60 w-2 h-2 bg-slate-500 rounded-full animate-bounce opacity-25"></div>
      
      {/* More scattered particles */}
      <div className="absolute top-60 left-20 w-1 h-1 bg-slate-400 rounded-full animate-ping opacity-35"></div>
      <div className="absolute top-80 right-10 w-2 h-2 bg-slate-300 rounded-full animate-pulse opacity-30"></div>
      <div className="absolute bottom-80 left-60 w-1 h-1 bg-slate-500 rounded-full animate-bounce opacity-40"></div>
      <div className="absolute bottom-10 right-80 w-2 h-2 bg-slate-400 rounded-full animate-ping opacity-25"></div>
      
      {/* Large decorative circles with darker tones */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-slate-700/10 to-transparent rounded-full opacity-20"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-slate-600/10 to-transparent rounded-full opacity-15"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-slate-800/10 to-transparent rounded-full opacity-10"></div>
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-slate-400/20 rounded-full animate-glow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-6 h-6 bg-slate-300/15 rounded-full animate-glow opacity-60"></div>
    </div>
    
  );
};
console.log("✅ MagicalBackground rendered");

export default MagicalBackground;
