"use client";

import { useEffect } from "react";
import { useAudio } from "@/components/contexts/audio-provider";

export function AudioPlayer() {
  const { audioRef, hasInteracted, setHasInteracted } = useAudio();

  useEffect(() => {
    // Set volume to 30% and start muted
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.muted = true;
      
      // Try to play (will likely be blocked by browser)
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Autoplay was prevented - this is expected
          console.log("Autoplay prevented, waiting for user interaction");
        });
      }
    }
  }, [audioRef]);

  useEffect(() => {
    // Listen for first user interaction to unmute
    const handleInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        audioRef.current.muted = false;
        setHasInteracted(true);
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
  }, [hasInteracted, audioRef, setHasInteracted]);

  return (
    <audio ref={audioRef} loop style={{ display: "none" }}>
      <source src="/audio.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}

