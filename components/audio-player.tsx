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
    
    // Create AudioContext and GainNode for precise volume control
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Create gain node with 25% volume (0.25)
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.25; // 25% volume using Web Audio API
      gainNodeRef.current = gainNode;
      
      // Create source from audio element
      const source = audioContext.createMediaElementSource(audio);
      sourceNodeRef.current = source;
      
      // Connect: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      console.log("🔊 Web Audio API initialized");
      console.log("🔊 GainNode gain set to:", gainNode.gain.value, "(25%)");
      console.log("🔊 Audio src:", audio.src || audio.querySelector("source")?.src);
    } catch (error) {
      console.error("❌ Failed to initialize Web Audio API:", error);
      // Fallback to HTML5 audio volume
      audio.volume = 0.25;
    }
    
    // Set initial state
    audio.muted = true;
    setIsMuted(true);
    
    // Force volume function - ensures volume stays at 25% using GainNode
    const enforceVolume = () => {
      if (gainNodeRef.current) {
        if (Math.abs(gainNodeRef.current.gain.value - 0.25) > 0.01) {
          console.warn("⚠️ GainNode gain changed from", gainNodeRef.current.gain.value, "to 0.25 (25%)");
          gainNodeRef.current.gain.value = 0.25;
        }
      } else if (audio.volume !== 0.25) {
        // Fallback to HTML5 volume
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
      const currentGain = gainNodeRef.current?.gain.value ?? audio.volume;
      console.log("🔊 Audio play event - GainNode gain:", currentGain, "(expected: 0.25)", "Muted:", audio.muted);
    };

    const handleVolumeChange = () => {
      const currentGain = gainNodeRef.current?.gain.value ?? audio.volume;
      console.log("🔊 Volume changed event - Current gain:", currentGain, "(expected: 0.25)");
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
      
      // Use GainNode for volume control if available, otherwise fallback to HTML5 volume
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = 0.25; // 25% volume using Web Audio API
        console.log("🔊 User interaction - Setting GainNode gain to 0.25 (25%)");
        console.log("🔊 GainNode gain:", gainNodeRef.current.gain.value);
      } else {
        audio.volume = 0.25; // Fallback to HTML5 volume
        console.log("🔊 User interaction - Setting HTML5 volume to 0.25 (25%)");
      }
      
      setIsMuted(false);
      console.log("🔊 Audio state - Muted:", audio.muted);
      
      // CRITICAL: play() MUST be called synchronously in the event handler
      // This is Chrome's requirement for user gesture
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("✓ Audio playing! duration:", audio.duration, "seconds");
            const currentGain = gainNodeRef.current?.gain.value ?? audio.volume;
            console.log("🔊 Gain after play:", currentGain, "(expected: 0.25)");
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
                if (gainNodeRef.current) {
                  gainNodeRef.current.gain.value = 0.25;
                  console.log("🔊 Retry - Setting GainNode gain to 0.25 (25%)");
                } else {
                  audio.volume = 0.25;
                  console.log("🔊 Retry - Setting HTML5 volume to 0.25 (25%)");
                }
                audio.play()
                  .then(() => {
                    const currentGain = gainNodeRef.current?.gain.value ?? audio.volume;
                    console.log("✓ Retry successful! Gain:", currentGain, "(expected: 0.25)");
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

  // Continuous volume monitoring - ensures volume stays at 25% using GainNode
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const volumeCheckInterval = setInterval(() => {
      if (gainNodeRef.current && !audio.muted) {
        if (Math.abs(gainNodeRef.current.gain.value - 0.25) > 0.01) {
          console.warn("⚠️ GainNode gain was changed to", gainNodeRef.current.gain.value, "- resetting to 0.25 (25%)");
          gainNodeRef.current.gain.value = 0.25;
        }
      } else if (!audio.muted && Math.abs(audio.volume - 0.25) > 0.01) {
        // Fallback to HTML5 volume
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

