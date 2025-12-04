"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Determine if we're in light mode
  const isLightMode = mounted && theme === "light";

  // Debug logging
  useEffect(() => {
    if (mounted) {
      console.log("🎥 Background video theme state:", {
        theme,
        isLightMode,
        mounted,
        shouldPause: isLightMode,
        shouldInvert: isLightMode
      });
    }
  }, [theme, isLightMode, mounted]);

  // Handle mounted state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // GitHub raw URL - works even if file isn't deployed to Vercel
  // Repo: https://github.com/MakcuTeam/Website
  // Browser will automatically cache this video in temp files based on HTTP headers
  // When users return, browser loads from cache (no download needed)
  const githubVideoSrc = "https://raw.githubusercontent.com/MakcuTeam/Website/main/public/background.mp4";
  const fallbackVideoSrc = "/background.mp4";

  useEffect(() => {
    if (!videoRef.current || !mounted) return;

    const video = videoRef.current;

    // Configure video for optimal caching and playback
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    
    // Track if video was loaded from cache (for debugging)
    const startTime = performance.now();
    let loadedFromCache = false;

    // Monitor network activity to detect cache hits
    const handleProgress = () => {
      const loadTime = performance.now() - startTime;
      // If video loads very quickly (<100ms), it's likely from cache
      if (loadTime < 100 && video.readyState >= 3) {
        loadedFromCache = true;
      }
    };

    // Try to play (browser will cache automatically in temp files)
    const playVideo = () => {
      // Only play if in dark mode
      if (!isLightMode) {
        video.play().catch((err) => {
          // Autoplay might be blocked, but that's okay since we're muted
          // Video will play once user interacts with page
          console.log("Background video autoplay:", err.message);
        });
      } else {
        video.pause();
      }
    };

    const handleCanPlay = () => {
      const loadTime = performance.now() - startTime;
      const cacheStatus = loadedFromCache || loadTime < 200 
        ? "✓ Loaded from browser cache (no download)" 
        : "↓ Downloaded from network (will be cached for next visit)";
      
      console.log("✓ Background video ready:", cacheStatus);
      console.log("  Source:", video.currentSrc);
      console.log("  Load time:", Math.round(loadTime), "ms");
      
      playVideo();
    };

    const handleLoadedMetadata = () => {
      console.log("📹 Background video metadata loaded, duration:", video.duration, "seconds");
    };

    video.addEventListener("progress", handleProgress);
    video.addEventListener("canplay", handleCanPlay, { once: true });
    video.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });

    // If video is already loaded (from previous visit), try playing immediately
    if (video.readyState >= 3) {
      loadedFromCache = true;
      console.log("⚡ Background video already cached, loading instantly");
      playVideo();
    }

    // Handle theme changes
    if (isLightMode) {
      console.log("⏸️ Pausing video (light mode)");
      video.pause();
    } else {
      console.log("▶️ Playing video (dark mode)");
      playVideo();
    }

    return () => {
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [isLightMode, mounted]);

  // Determine filter value
  const videoFilter = isLightMode ? "invert(1) brightness(1.2)" : "none";
  
  // Debug filter value
  useEffect(() => {
    if (mounted) {
      console.log("🎬 Video filter applied:", {
        isLightMode,
        filter: videoFilter,
        theme,
        htmlHasDarkClass: document.documentElement.classList.contains("dark")
      });
    }
  }, [isLightMode, videoFilter, theme, mounted]);

  return (
    <video
      ref={videoRef}
      className="fixed inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
      style={{
        zIndex: -1,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        objectFit: "cover",
        transform: "none",
        willChange: "transform",
        // Invert video in light mode for clean light background
        filter: videoFilter,
        transition: "filter 0.3s ease-in-out",
      }}
      loop
      muted
      playsInline
      autoPlay
      preload="auto"
    >
      {/* Primary source: GitHub raw URL (will be cached by browser) */}
      <source src={githubVideoSrc} type="video/mp4" />
      {/* Fallback: Local file if GitHub source fails */}
      <source src={fallbackVideoSrc} type="video/mp4" />
      Your browser does not support the video element.
    </video>
  );
}
