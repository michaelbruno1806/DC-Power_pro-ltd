import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the top on route change, and to the matching element when the
 * URL carries a hash (e.g. /#features), so in-page links work from any page.
 */
const ScrollManager = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      // Wait a frame so the target section is mounted.
      const raf = requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0 });
      });
      return () => cancelAnimationFrame(raf);
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
};

export default ScrollManager;
