"use client";

import { useEffect, useRef } from "react";
import { useAudio } from "@/components/contexts/audio-provider";

export function AudioPlayer() {
  const { audioRef, gainNodeRef, hasInteracted, setHasInteracted, setIsMuted } = useAudio();
  const isInitialized = useRef(false);
  const interactionHandled = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Initialize Web Audio API with GainNode for precise volume control
  useEffect(() => {
    if (!audioRef.current || isInitialized.current) return;
    isInitialized.current = true;

    const audio = audioRef.current;
    
    // GitHub raw URLs don't support CORS for Web Audio API, so we use HTML5 audio volume control
    // Set volume directly using HTML5 audio API (more reliable for cross-origin sources)
    audio.volume = 0.25; // 25% volume
    gainNodeRef.current = null; // Don't use Web Audio API
    audioContextRef.current = null;
    
    console.log("🔊 Using HTML5 audio volume control (0.25 = 25%)");
    console.log("🔊 Audio src:", audio.src || audio.querySelector("source")?.src);
    console.log("🔊 Note: Web Audio API skipped due to GitHub raw URL CORS limitations");
    
    // Set initial state - ALWAYS use HTML5 audio volume (Web Audio API blocked by CORS)
    audio.volume = 0.25; // 25% volume
    audio.muted = true;
    setIsMuted(true);
    console.log("🔊 Initial audio volume set to:", audio.volume, "(25%)");
    
    // Force volume function - ensures volume stays at 25% using HTML5 audio volume
    const enforceVolume = () => {
      if (Math.abs(audio.volume - 0.25) > 0.01) {
        console.warn("⚠️ Volume changed from", audio.volume, "to 0.25 (25%)");
        audio.volume = 0.25;
      }
    };
    
    // Add event listeners for debugging and volume enforcement
    const handleLoadedData = () => {
      console.log("🔊 Audio loaded successfully, readyState:", audio.readyState);
      enforceVolume();
    };
    
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      if (audio.error) {
        console.error("Error code:", audio.error.code, "Message:", audio.error.message);
        console.error("Audio src:", audio.src);
        console.error("Audio currentSrc:", audio.currentSrc);
        
        // Error code 2 = NETWORK ERROR (file not found)
        if (audio.error.code === 2) {
          console.error("❌ NETWORK ERROR: Audio file not found!");
          console.error("💡 File should be at: https://www.makcu.com/audio.mp3");
          console.error("💡 Make sure public/audio.mp3 is committed and deployed to Vercel");
        }
      }
    };
    
    const handlePlay = () => {
      enforceVolume();
      console.log("🔊 Audio play event - Volume:", audio.volume, "(expected: 0.25)", "Muted:", audio.muted);
    };

    const handleVolumeChange = () => {
      console.log("🔊 Volume changed event - Current volume:", audio.volume, "(expected: 0.25)");
      enforceVolume();
    };

    const handleCanPlayThrough = () => {
      console.log("🔊 Audio can play through, readyState:", audio.readyState);
      enforceVolume();
    };
    
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("error", handleError);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("volumechange", handleVolumeChange);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);

    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("volumechange", handleVolumeChange);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
    };
  }, [audioRef, setIsMuted]);

  // Handle user interaction - MUST be synchronous for Chrome!
  useEffect(() => {
    if (hasInteracted) return;

    const handleInteraction = () => {
      // Prevent multiple handlers from firing
      if (interactionHandled.current || !audioRef.current) return;
      interactionHandled.current = true;

      const audio = audioRef.current;
      console.log("User interaction - playing audio SYNCHRONOUSLY");
      console.log("readyState:", audio.readyState, "src:", audio.currentSrc || audio.src);
      
      // Set up audio state FIRST (must be before play)
      audio.muted = false;
      
      // Set HTML5 audio volume to 25%
      audio.volume = 0.25;
      console.log("🔊 User interaction - Setting HTML5 volume to 0.25 (25%)");
      console.log("🔊 Current volume:", audio.volume);
      
      setIsMuted(false);
      console.log("🔊 Audio state - Muted:", audio.muted);
      
      // CRITICAL: play() MUST be called synchronously in the event handler
      // This is Chrome's requirement for user gesture
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("✓ Audio playing! duration:", audio.duration, "seconds");
            console.log("🔊 Volume after play:", audio.volume, "(expected: 0.25)");
            console.log("🔊 Muted state:", audio.muted);
            setHasInteracted(true);
          })
          .catch((error) => {
            console.error("✗ Play failed:", error.name, error.message);
            
            // If it failed because audio isn't loaded, load and retry
            if (audio.readyState === 0) {
              console.log("Loading audio and retrying...");
              audio.load();
              audio.oncanplaythrough = () => {
                audio.oncanplaythrough = null;
                audio.muted = false;
                audio.volume = 0.25;
                console.log("🔊 Retry - Setting HTML5 volume to 0.25 (25%)");
                audio.play()
                  .then(() => {
                    console.log("✓ Retry successful! Volume:", audio.volume, "(expected: 0.25)");
                    setHasInteracted(true);
                  })
                  .catch((e) => {
                    console.error("Retry failed:", e);
                    interactionHandled.current = false;
                  });
              };
            } else {
              interactionHandled.current = false;
            }
          });
      } else {
        setHasInteracted(true);
      }
    };

    // Add listeners
    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [hasInteracted, audioRef, setHasInteracted, setIsMuted]);

  // Continuous volume monitoring - ensures volume stays at 25% using HTML5 audio volume
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const volumeCheckInterval = setInterval(() => {
      if (!audio.muted && Math.abs(audio.volume - 0.25) > 0.01) {
        console.warn("⚠️ Volume was changed to", audio.volume, "- resetting to 0.25 (25%)");
        audio.volume = 0.25;
      }
    }, 1000); // Check every second

    return () => clearInterval(volumeCheckInterval);
  }, [audioRef]);

  // Use GitHub raw URL directly - works even if file isn't deployed to Vercel
  // Repo: https://github.com/MakcuTeam/Website
  // This loads directly from GitHub, bypassing Vercel deployment issues
  const audioSrc = "https://raw.githubusercontent.com/MakcuTeam/Website/main/public/audio.mp3";

  return (
    <audio 
      ref={audioRef} 
      loop 
      preload="auto" 
      style={{ display: "none" }}
      playsInline
    >
      <source src={audioSrc} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}

