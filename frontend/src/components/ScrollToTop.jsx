// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll instantly to top whenever the pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component renders nothing to the UI
};

export default ScrollToTop;
