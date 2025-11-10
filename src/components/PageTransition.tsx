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
        }, 200);
      });
      
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (timer) clearTimeout(timer);
      };
    }
  }, [location.pathname, location.hash]); // Only depend on location properties, not the whole object

  return (
    <div
      className={`transition-opacity duration-500 ease-in-out will-change-opacity ${
        transitionStage === "entering" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;

