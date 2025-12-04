"use client";

import { useEffect } from "react";

/**
 * Prevents over-scrolling by dynamically calculating the actual content height
 * and stopping scroll at the correct position
 */
export function PreventOverScroll() {
  useEffect(() => {
    let rafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let scrollTimeout: NodeJS.Timeout | null = null;
    let maxScrollPosition = Infinity;

    const calculateMaxScroll = (): number => {
      // Get all major structural elements
      const footer = document.querySelector("footer");
      const main = document.querySelector("main");
      const body = document.body;
      const html = document.documentElement;

      // Find the actual last visible element by checking all elements
      let lastVisibleBottom = 0;
      let lastVisibleElement: Element | null = null;

      // Check footer first (should be last)
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const footerBottom = footerRect.bottom + window.scrollY;
        if (footerBottom > lastVisibleBottom && footerRect.height > 0) {
          lastVisibleBottom = footerBottom;
          lastVisibleElement = footer;
        }
      }

      // Check main content area
      if (main) {
        const mainRect = main.getBoundingClientRect();
        const mainBottom = mainRect.bottom + window.scrollY;
        if (mainBottom > lastVisibleBottom && mainRect.height > 0) {
          lastVisibleBottom = mainBottom;
          if (!lastVisibleElement) lastVisibleElement = main;
        }
      }

      // Fallback: use scrollHeight if we can't find elements
      if (!lastVisibleElement || lastVisibleBottom === 0) {
        const contentHeight = Math.max(
          body.scrollHeight,
          html.scrollHeight,
          body.offsetHeight,
          html.offsetHeight
        );
        const viewportHeight = window.innerHeight;
        return Math.max(0, contentHeight - viewportHeight);
      }

      // Get viewport height
      const viewportHeight = window.innerHeight;

      // Maximum scroll is when last element bottom aligns with viewport bottom
      // Account for any transform scale (0.9 scale means we need to adjust)
      const maxScroll = Math.max(0, lastVisibleBottom - viewportHeight);

      return maxScroll;
    };

    const updateScrollLimit = () => {
      maxScrollPosition = calculateMaxScroll();
    };

    const handleScroll = () => {
      // Debounce scroll checking
      if (scrollTimeout) clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const currentScroll = window.scrollY;
        const tolerance = 5; // Small buffer for rounding

        // If we've scrolled too far, snap back to max position
        if (currentScroll > maxScrollPosition + tolerance) {
          window.scrollTo({
            top: maxScrollPosition,
            behavior: "auto",
          });
        }
      }, 16); // ~60fps
    };

    const handleWheel = (e: WheelEvent) => {
      const currentScroll = window.scrollY;
      const isScrollingDown = e.deltaY > 0;
      const tolerance = 10;

      // If we're at or near the bottom and trying to scroll down, prevent it
      if (isScrollingDown && currentScroll >= maxScrollPosition - tolerance) {
        e.preventDefault();
        window.scrollTo({
          top: maxScrollPosition,
          behavior: "auto",
        });
        return;
      }

      // If we're beyond max scroll, prevent further scrolling
      if (currentScroll > maxScrollPosition + tolerance) {
        e.preventDefault();
        window.scrollTo({
          top: maxScrollPosition,
          behavior: "auto",
        });
      }
    };

    // Initial calculation
    const initialDelay = setTimeout(() => {
      updateScrollLimit();
      handleScroll();
    }, 100); // Small delay to ensure DOM is ready

    // Update on resize and content changes
    const scheduleUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateScrollLimit();
        handleScroll();
      });
    };

    // Observe content changes in main and footer
    resizeObserver = new ResizeObserver(scheduleUpdate);
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    
    if (main) resizeObserver.observe(main);
    if (footer) resizeObserver.observe(footer);

    // Update on window resize
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("orientationchange", scheduleUpdate);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });

    // Update when images load (they can change content height)
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", scheduleUpdate, { once: true });
      }
    });

    // Cleanup
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (resizeObserver) resizeObserver.disconnect();
      if (initialDelay) clearTimeout(initialDelay);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("orientationchange", scheduleUpdate);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      images.forEach((img) => {
        img.removeEventListener("load", scheduleUpdate);
      });
    };
  }, []);

  return null;
}
