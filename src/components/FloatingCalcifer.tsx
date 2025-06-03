
import { useState, useEffect } from "react";

const FloatingCalcifer = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const animate = () => {
      setPosition({
        x: Math.sin(Date.now() * 0.001) * 20,
        y: Math.cos(Date.now() * 0.0015) * 15
      });
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed bottom-20 right-20 z-10 pointer-events-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
    >
      <div className="relative">
        {/* Calcifer Image */}
        <img 
          src="/lovable-uploads/e88d3c05-6783-4203-8a8b-20132e935fd2.png"
          alt="Calcifer"
          className="w-20 h-auto drop-shadow-lg"
        />
        
        {/* Sparks around Calcifer */}
        <div className="absolute -top-2 left-1/2 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
        <div className="absolute top-2 -right-2 w-1 h-1 bg-orange-300 rounded-full animate-pulse"></div>
        <div className="absolute top-4 left-2 w-1 h-1 bg-red-300 rounded-full animate-ping opacity-60"></div>
      </div>
    </div>
  );
};

export default FloatingCalcifer;
