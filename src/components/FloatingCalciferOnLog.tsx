
import { useState, useEffect } from "react";

const FloatingCalciferOnLog = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const animate = () => {
      setPosition({
        x: Math.sin(Date.now() * 0.0008) * 30,
        y: Math.cos(Date.now() * 0.001) * 25
      });
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed top-32 left-20 z-10 pointer-events-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
    >
      <div className="relative">
        {/* Calcifer on Log */}
        <img 
          src="/lovable-uploads/f5f11ea3-d252-4d43-a507-4a1a44cce636.png"
          alt="Calcifer on Log"
          className="w-24 h-auto drop-shadow-lg"
        />
        
        {/* Additional flame sparkles */}
        <div className="absolute -top-2 left-1/2 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
        <div className="absolute top-2 -right-1 w-1 h-1 bg-orange-300 rounded-full animate-pulse"></div>
        <div className="absolute top-4 left-2 w-1 h-1 bg-red-300 rounded-full animate-ping opacity-60"></div>
      </div>
    </div>
  );
};

export default FloatingCalciferOnLog;
