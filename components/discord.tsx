"use client";

import { Card } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { BotMessageSquare } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useEffect, useRef, useState } from "react";
import type { Member } from "@/store/discordSlice";

// Fisher-Yates shuffle algorithm for proper randomization
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const DiscordCard = () => {
  const discordStore = useSelector((state: RootState) => state.discord);
  const [randomizedMembers, setRandomizedMembers] = useState<Member[]>([]);
  const [isFading, setIsFading] = useState(false);
  const fadeTimeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const FADE_DURATION = 400; // ms

  // Function to randomize members
  const randomizeMembers = (withFade = true) => {
    const members = discordStore?.data?.members;
    if (!members || members.length === 0) {
      setRandomizedMembers([]);
      return;
    }
    
    // Always shuffle and take up to 72 unique members (8 rows x 9 columns)
    // This ensures no duplicates and random order
    const shuffled = shuffleArray(members).slice(0, 72);

    // Optional fade transition between sets
    const applyShuffle = () => {
      setRandomizedMembers(shuffled);
      setIsFading(false);
    };

    if (withFade) {
      setIsFading(true);
      if (fadeTimeoutRef.current) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
      // Wait for fade-out to complete before swapping, then fade back in
      fadeTimeoutRef.current = window.setTimeout(applyShuffle, FADE_DURATION);
    } else {
      applyShuffle();
    }
  };

  // Randomize when data changes and keep rotating the visible set
  useEffect(() => {
    const members = discordStore?.data?.members;
    if (!members || members.length === 0) {
      setRandomizedMembers([]);
      return;
    }

    // Initial randomization for the current mount/data load (no fade to avoid flash)
    randomizeMembers(false);

    // If we have more than one full grid, rotate every 12 seconds
    const shouldRotate = members.length > 72;
    if (shouldRotate) {
      intervalRef.current = window.setInterval(() => randomizeMembers(true), 12000);
    }

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (fadeTimeoutRef.current) window.clearTimeout(fadeTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discordStore?.data?.members]);

  return (
    <div className="flex flex-col gap-5">
      <span className="flex gap-3 items-center mb-8">
        <div className="w-auto text-left flex-grow-1 flex-2 text-xl font-logo">
          Online Customer ({discordStore?.data?.presence_count})
        </div>
        <div className="w-full border-b dark:border-b-[hsl(var(--border))] rounded flex-1" />
      </span>

      <div
        className={`grid grid-cols-9 gap-3 text-sm transition-opacity ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
        style={{ transitionDuration: `${FADE_DURATION}ms` }}
      >
        {randomizedMembers.map((member, index) => (
          <Card
            className="relative bg-transparent backdrop-blur-sm flex gap-3 items-center justify-between uppercase max-w-40 min-w-40 overflow-hidden"
            key={`${member.id}-${index}`}
          >
            <span className="overflow-hidden pl-3 whitespace-nowrap">
              {member.username}
            </span>
            <Avatar className="rounded-none w-12 h-12">
              <AvatarImage src={member.avatar_url} className="rounded-none" />
            </Avatar>
          </Card>
        ))}
      </div>
    </div>
  );
};
