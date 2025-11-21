"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/components/contexts/audio-provider";

export function AudioToggle() {
  const { isMuted, toggleMute } = useAudio();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMute}
      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
    >
      {isMuted ? (
        <VolumeX className="h-[1.1rem] w-[1.1rem]" />
      ) : (
        <Volume2 className="h-[1.1rem] w-[1.1rem]" />
      )}
      <span className="sr-only">{isMuted ? "Unmute audio" : "Mute audio"}</span>
    </Button>
  );
}

