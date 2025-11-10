import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type PageTransitionProps = {
  children: React.ReactNode;
};

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<"entering" | "entered">("entered");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname || location.hash !== displayLocation.hash) {
      setTransitionStage("entering");
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("entered");
      }, 150); // Half of transition duration
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`transition-opacity duration-300 ${
        transitionStage === "entering" ? "opacity-0" : "opacity-100"
      }`}
    >
      {children}
    </div>
  );
};

export default PageTransition;

