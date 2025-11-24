"use client";

import { Card } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { BotMessageSquare } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useState, useEffect, useLayoutEffect } from "react";

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
  const [randomizedMembers, setRandomizedMembers] = useState<typeof discordStore.data.members>([]);

  // Function to randomize members
  const randomizeMembers = () => {
    const members = discordStore?.data?.members;
    if (!members || members.length === 0) {
      setRandomizedMembers([]);
      return;
    }
    
    // Always shuffle and take up to 45 unique members
    // This ensures no duplicates and random order
    const shuffled = shuffleArray(members);
    setRandomizedMembers(shuffled.slice(0, 45));
  };

  // Randomize on every mount (page load/navigation)
  // Empty deps ensure this runs on every component mount
  useLayoutEffect(() => {
    randomizeMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = runs on every mount for fresh randomization

  // Also update when members data changes (e.g., when data loads)
  useEffect(() => {
    randomizeMembers();
  }, [discordStore?.data?.members]);

  return (
    <div className="flex flex-col gap-5">
      <span className="flex gap-3 items-center mb-8">
        <div className="w-auto text-left flex-grow-1 flex-2 text-xl font-logo">
          Online Customer ({discordStore?.data?.presence_count})
        </div>
        <div className="w-full border-b dark:border-b-[hsl(var(--border))] rounded flex-1" />
      </span>

      <div className="grid grid-cols-9 gap-3 text-sm">
        {randomizedMembers.map((member, index) => (
          <Card
            className="relative bg-transparent backdrop-blur-sm flex gap-3 items-center justify-between uppercase max-w-40 min-w-40 overflow-hidden"
            key={`${member.id}-${index}`}
          >
            <span className="overflow-hidden pl-3 whitespace-nowrap text-ellipsis">
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
