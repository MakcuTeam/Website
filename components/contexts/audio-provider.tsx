"use client";

import React, { createContext, useContext, useRef, useState, useEffect } from "react";

interface AudioContextType {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  gainNodeRef: React.RefObject<GainNode | null>;
  isMuted: boolean;
  toggleMute: () => void;
  hasInteracted: boolean;
  setHasInteracted: (value: boolean) => void;
  setIsMuted: (value: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const toggleMute = async () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      console.log("🔊 Toggle mute:", { from: isMuted, to: newMutedState });
      
      // If unmuting, ensure audio is playing first and set volume using GainNode
      if (!newMutedState) {
        // Use GainNode for volume control if available, otherwise fallback to HTML5 volume
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = 0.15; // 15% volume using Web Audio API
          console.log("🔊 Unmuting - Setting GainNode gain to 0.15 (15%)");
        } else {
          audioRef.current.volume = 0.15; // Fallback to HTML5 volume
          console.log("🔊 Unmuting - Setting HTML5 volume to 0.15 (15%)");
        }
        try {
          if (audioRef.current.paused) {
            console.log("🔊 Audio is paused, attempting to play");
            await audioRef.current.play();
          }
        } catch (error) {
          console.error("Error playing audio when unmuting:", error);
          // If play fails, don't unmute
          return;
        }
      }
      
      // Set muted state
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // Force volume to 15% even after unmuting using GainNode
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = 0.15;
      } else {
        audioRef.current.volume = 0.15;
      }
      
      const currentGain = gainNodeRef.current?.gain.value ?? audioRef.current.volume;
      console.log("🔊 Audio state after toggle:", {
        paused: audioRef.current.paused,
        muted: audioRef.current.muted,
        gain: currentGain,
        expectedGain: 0.15,
        readyState: audioRef.current.readyState
      });
      
      if (Math.abs(currentGain - 0.15) > 0.01) {
        console.warn("⚠️ Gain mismatch! Expected 0.15, got:", currentGain);
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{
        audioRef,
        gainNodeRef,
        isMuted,
        toggleMute,
        hasInteracted,
        setHasInteracted,
        setIsMuted,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

