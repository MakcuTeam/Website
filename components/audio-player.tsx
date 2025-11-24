"use client";

import { useEffect } from "react";
import { useAudio } from "@/components/contexts/audio-provider";

export function AudioPlayer() {
  const { audioRef, hasInteracted, setHasInteracted, setIsMuted } = useAudio();

  useEffect(() => {
    // Set volume to 30% and start muted
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // Temporarily increased to 50% for testing
      audioRef.current.muted = true;
      
      // Add event listeners for debugging
      audioRef.current.addEventListener("loadeddata", () => {
        console.log("Audio loaded successfully");
      });
      
      audioRef.current.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        console.error("Audio error details:", audioRef.current?.error);
      });
      
      audioRef.current.addEventListener("play", () => {
        console.log("Audio started playing");
        console.log("Volume:", audioRef.current?.volume);
        console.log("Muted:", audioRef.current?.muted);
      });
      
      // Try to play (will likely be blocked by browser)
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio play promise resolved");
          })
          .catch((error) => {
            // Autoplay was prevented - this is expected
            console.log("Autoplay prevented, waiting for user interaction:", error);
          });
      }
    }
  }, [audioRef]);

  useEffect(() => {
    // Listen for first user interaction to unmute and play
    const handleInteraction = async () => {
      if (!hasInteracted && audioRef.current) {
        try {
          console.log("User interaction detected, attempting to play audio");
          
          // Unmute and play
          audioRef.current.muted = false;
          setIsMuted(false);
          
          // Ensure audio is playing
          if (audioRef.current.paused) {
            console.log("Audio is paused, attempting to play");
            await audioRef.current.play();
            console.log("Audio play() called, current state:", {
              paused: audioRef.current.paused,
              muted: audioRef.current.muted,
              volume: audioRef.current.volume,
              readyState: audioRef.current.readyState
            });
          } else {
            console.log("Audio is already playing");
          }
          
          setHasInteracted(true);
        } catch (error) {
          console.error("Error playing audio:", error);
        }
      }
    };

    // Listen for any user interaction
    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [hasInteracted, audioRef, setHasInteracted, setIsMuted]);

  return (
    <audio 
      ref={audioRef} 
      loop 
      preload="auto" 
      style={{ display: "none" }}
      autoPlay
    >
      <source src="/audio.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}

