import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const homeTitle = "RCMP Practice Tests & Entrance Assessment Prep | AptitudeForge";
const homeDescription = "Prepare for the RCMP Online Entrance Assessment with practice questions, timed tests, and lessons in numerical skills, memory, and spatial reasoning.";
const canonicalHome = "https://www.aptitudeforge.ca/";

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function SeoMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const home = pathname === "/";
    const label = pathname === "/signup" ? "Your account" : pathname === "/dashboard" ? "Training dashboard"
      : pathname === "/admin" ? "Admin workspace" : pathname.startsWith("/module/") ? "Training lessons"
        : pathname.startsWith("/test/") ? "Practice test" : "Page not found";
    const title = home ? homeTitle : `${label} | AptitudeForge`;
    document.title = title;
    setMeta("name", "description", home ? homeDescription : `${label} on AptitudeForge.`);
    // Leave these URLs crawlable so Google can see noindex after rendering.
    setMeta("name", "robots", home ? "index, follow" : "noindex, follow");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", home ? homeDescription : `${label} on AptitudeForge.`);
    setMeta("property", "og:url", home ? canonicalHome : new URL(pathname, canonicalHome).href);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (home) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalHome;
    } else {
      canonical?.remove();
    }
  }, [pathname]);
  return null;
}
