"use client";

import { useEffect } from "react";

/**
 * Fixes the scrollbar height to match the actual content height
 * This prevents the bounce effect by setting the document height to match where content actually ends
 */
export function FixScrollbarHeight() {
  useEffect(() => {
    let rafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const updateScrollbarHeight = () => {
      // Get the footer element (last visible content)
      const footer = document.querySelector("footer");
      
      if (!footer) return;

      // Get the footer's bottom position relative to the document
      const footerRect = footer.getBoundingClientRect();
      const footerBottom = footerRect.bottom + window.scrollY;
      
      // Set the document height to exactly match where the footer ends
      // This ensures the scrollbar matches the actual content length
      const body = document.body;
      const html = document.documentElement;
      
      // Set height to match the actual content end
      body.style.height = `${footerBottom}px`;
      html.style.height = `${footerBottom}px`;
      
      // Ensure overflow is handled correctly
      html.style.overflowY = 'auto';
    };

    const scheduleUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateScrollbarHeight();
      });
    };

    // Initial update with a small delay to ensure DOM is ready
    const initialDelay = setTimeout(() => {
      updateScrollbarHeight();
    }, 100);

    // Observe content changes
    resizeObserver = new ResizeObserver(scheduleUpdate);
    const footer = document.querySelector("footer");
    
    if (footer) resizeObserver.observe(footer);
    
    // Observe the scaled container if it exists
    const scaledContainer = document.body.querySelector('[style*="transform: scale"]');
    if (scaledContainer) resizeObserver.observe(scaledContainer);

    // Update on window resize
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("orientationchange", scheduleUpdate);
    window.addEventListener("load", scheduleUpdate);

    // Update when images load
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", scheduleUpdate, { once: true });
      }
    });

    // Cleanup
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      if (initialDelay) clearTimeout(initialDelay);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("orientationchange", scheduleUpdate);
      window.removeEventListener("load", scheduleUpdate);
      
      // Reset styles on cleanup
      document.body.style.height = "";
      document.documentElement.style.height = "";
      document.documentElement.style.overflowY = "";
    };
  }, []);

  return null;
}
