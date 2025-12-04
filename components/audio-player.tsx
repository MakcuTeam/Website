"use client";

import { useEffect } from "react";
import { useAudio } from "@/components/contexts/audio-provider";

export function AudioPlayer() {
  const { audioRef, hasInteracted, setHasInteracted, setIsMuted } = useAudio();

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    // Set initial volume
    audio.volume = 0.5;
    
    // Add event listeners for debugging
    const handleLoadedData = () => {
      console.log("Audio loaded successfully");
    };
    
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      console.error("Audio error details:", audio.error);
    };
    
    const handlePlay = () => {
      console.log("Audio started playing");
      console.log("Volume:", audio.volume);
      console.log("Muted:", audio.muted);
    };

    const handleCanPlay = () => {
      console.log("Audio can play, readyState:", audio.readyState);
      // Don't try to autoplay - wait for user interaction
      if (!hasInteracted) {
        audio.muted = true;
        setIsMuted(true);
      }
    };
    
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("error", handleError);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("canplay", handleCanPlay);
    
    // Load the audio
    audio.load();

    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioRef, hasInteracted, setIsMuted]);

  useEffect(() => {
    if (hasInteracted) return;

    // Listen for first user interaction to unlock audio and play with sound
    const handleInteraction = (e: Event) => {
      if (!audioRef.current) return;

      const audio = audioRef.current;
      console.log("User interaction detected, attempting to unlock and play audio");
      
      // For Chrome: Play must happen synchronously in the event handler
      // Unmute immediately
      audio.muted = false;
      setIsMuted(false);
      
      // If audio is paused or not playing, start it
      if (audio.paused) {
        // Reset to beginning if needed
        if (audio.currentTime > 0) {
          audio.currentTime = 0;
        }
        
        // Play immediately - Chrome requires this to be in the event handler
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio play promise resolved");
              setHasInteracted(true);
              console.log("Audio play() successful, current state:", {
                paused: audio.paused,
                muted: audio.muted,
                volume: audio.volume,
                readyState: audio.readyState,
                networkState: audio.networkState
              });
            })
            .catch((error) => {
              console.error("Error playing audio:", error);
              // If play fails, keep trying on next interaction
            });
        } else {
          setHasInteracted(true);
        }
      } else {
        // Already playing, just unmute
        setHasInteracted(true);
        console.log("Audio already playing, unmuted");
      }
    };

    // Use capture phase and non-passive to ensure we catch the event
    const options = { capture: true, passive: false, once: false };
    
    document.addEventListener("click", handleInteraction, options);
    document.addEventListener("keydown", handleInteraction, options);
    document.addEventListener("touchstart", handleInteraction, options);
    document.addEventListener("pointerdown", handleInteraction, options);

    return () => {
      document.removeEventListener("click", handleInteraction, { capture: true } as any);
      document.removeEventListener("keydown", handleInteraction, { capture: true } as any);
      document.removeEventListener("touchstart", handleInteraction, { capture: true } as any);
      document.removeEventListener("pointerdown", handleInteraction, { capture: true } as any);
    };
  }, [hasInteracted, audioRef, setHasInteracted, setIsMuted]);

  return (
    <audio 
      ref={audioRef} 
      loop 
      preload="auto" 
      style={{ display: "none" }}
      playsInline
      crossOrigin="anonymous"
    >
      <source src="/audio.mp3" type="audio/mpeg" />
      <source src="/audio.mp3" type="audio/mp3" />
      Your browser does not support the audio element.
    </audio>
  );
}

