"use client";

import React, { createContext, useContext, useRef, useState, useEffect } from "react";

interface AudioContextType {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isMuted: boolean;
  toggleMute: () => void;
  hasInteracted: boolean;
  setHasInteracted: (value: boolean) => void;
  setIsMuted: (value: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const toggleMute = async () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      console.log("Toggle mute:", { from: isMuted, to: newMutedState });
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // If unmuting, ensure audio is playing
      if (!newMutedState) {
        try {
          if (audioRef.current.paused) {
            console.log("Audio is paused, attempting to play");
            await audioRef.current.play();
          }
          console.log("Audio state after unmute:", {
            paused: audioRef.current.paused,
            muted: audioRef.current.muted,
            volume: audioRef.current.volume,
            readyState: audioRef.current.readyState
          });
        } catch (error) {
          console.error("Error playing audio:", error);
        }
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{
        audioRef,
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

