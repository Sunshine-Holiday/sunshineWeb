import { useEffect } from "react";

/**
 * Smooth scrolling for in-page anchors only.
 * Route changes use behavior: "auto" so pages open at the top immediately.
 */
export const useSmooth = () => {
  useEffect(() => {
    // Prefer auto so React Router navigations land at top without lag
    document.documentElement.style.scrollBehavior = "auto";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);
};