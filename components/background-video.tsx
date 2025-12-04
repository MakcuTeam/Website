"use client";

import { useEffect, useRef } from "react";

export function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // GitHub raw URL - works even if file isn't deployed to Vercel
  // Repo: https://github.com/MakcuTeam/Website
  // Browser will automatically cache this video based on HTTP headers
  const githubVideoSrc = "https://raw.githubusercontent.com/MakcuTeam/Website/main/public/background.mp4";
  const fallbackVideoSrc = "/background.mp4";

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Configure video for optimal caching and playback
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    
    // Try to play (browser will cache automatically)
    const playVideo = () => {
      video.play().catch((err) => {
        // Autoplay might be blocked, but that's okay since we're muted
        // Video will play once user interacts with page
        console.log("Background video autoplay:", err.message);
      });
    };

    const handleCanPlay = () => {
      console.log("✓ Background video loaded and ready, src:", video.currentSrc);
      playVideo();
    };

    // If video is already loaded, try playing immediately
    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener("canplay", handleCanPlay, { once: true });
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="fixed inset-0 w-full h-full object-cover pointer-events-none"
      style={{
        zIndex: 0,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
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
