
import { useState, useEffect } from "react";

const FloatingHeen = () => {
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
        {/* Heen's body */}
        <div className="w-20 h-12 bg-gradient-to-r from-green-300 to-green-400 rounded-full relative shadow-lg">
          {/* Eyes */}
          <div className="absolute top-3 left-4 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute top-3 left-7 w-2 h-2 bg-black rounded-full"></div>
          
          {/* Nose */}
          <div className="absolute top-5 left-5 w-2 h-1 bg-pink-400 rounded-full"></div>
          
          {/* Legs */}
          <div className="absolute -bottom-2 left-2 w-2 h-4 bg-green-400 rounded-full"></div>
          <div className="absolute -bottom-2 left-6 w-2 h-4 bg-green-400 rounded-full"></div>
          <div className="absolute -bottom-2 right-6 w-2 h-4 bg-green-400 rounded-full"></div>
          <div className="absolute -bottom-2 right-2 w-2 h-4 bg-green-400 rounded-full"></div>
          
          {/* Tail */}
          <div className="absolute top-4 -right-3 w-6 h-2 bg-green-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default FloatingHeen;
