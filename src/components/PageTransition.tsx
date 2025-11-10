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

  useEffect(() => {
    const currentPath = location.pathname + location.hash;
    const displayPath = displayLocation.pathname + displayLocation.hash;
    
    if (currentPath !== displayPath && !isTransitioning.current) {
      isTransitioning.current = true;
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
        }, 200); // Slightly longer for smoother transition
      });
      
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (timer) clearTimeout(timer);
        isTransitioning.current = false;
      };
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`transition-opacity duration-500 ease-in-out will-change-opacity ${
        transitionStage === "entering" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        minHeight: "100vh", // Prevent layout shift
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;

