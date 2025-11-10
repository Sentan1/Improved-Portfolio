import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

type PageTransitionProps = {
  children: React.ReactNode;
};

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<"entering" | "entered">("entered");
  const isTransitioning = useRef(false);
  const locationKeyRef = useRef<string>(location.pathname + location.hash);

  useEffect(() => {
    const currentPath = location.pathname + location.hash;
    const currentKey = currentPath;
    
    // Only transition if the path actually changed and we're not already transitioning
    if (currentKey !== locationKeyRef.current && !isTransitioning.current) {
      isTransitioning.current = true;
      locationKeyRef.current = currentKey;
      setTransitionStage("entering");
      
      let timer: NodeJS.Timeout;
      let rafId: number;
      
      // Use requestAnimationFrame for smoother transitions
      rafId = requestAnimationFrame(() => {
        timer = setTimeout(() => {
          setDisplayLocation(location);
          requestAnimationFrame(() => {
            setTransitionStage("entered");
            isTransitioning.current = false;
          });
        }, 250);
      });
      
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (timer) clearTimeout(timer);
      };
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="relative min-h-screen bg-slate-900">
      {/* Dark overlay during transition to prevent white flash */}
      <div
        className={`fixed inset-0 bg-slate-900 z-50 pointer-events-none transition-opacity duration-300 ${
          transitionStage === "entering" ? "opacity-100" : "opacity-0"
        }`}
      />
      
      {/* Content with fade, scale, and slide effect */}
      <div
        key={displayLocation.pathname + displayLocation.hash}
        className={`relative transition-all duration-500 ease-out ${
          transitionStage === "entering" 
            ? "opacity-0 scale-[0.98] translate-y-4" 
            : "opacity-100 scale-100 translate-y-0"
        }`}
        style={{
          willChange: "opacity, transform",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PageTransition;

