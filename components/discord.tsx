"use client";

import { Card } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { BotMessageSquare } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const DiscordCard = () => {
  const discordStore = useSelector((state: RootState) => state.discord);

  return (
    <div className="flex flex-col gap-5">
      <span className="flex gap-3 items-center mb-8">
        <div className="w-auto text-left flex-grow-1 flex-2 text-xl font-logo">
          Online Customer ({discordStore?.data?.presence_count})
        </div>
        <div className="w-full border-b dark:border-b-[hsl(var(--border))] rounded flex-1" />
      </span>

      <div className="grid grid-cols-9 gap-3 text-sm">
        {discordStore?.data?.members &&
          Array.from({ length: 45 }, (_, index) => {
            const member = discordStore.data.members[index % discordStore.data.members.length];
            if (!member) return null;
            return (
              <Card
                className="relative bg-transparent backdrop-blur-sm flex gap-3 items-center justify-between uppercase max-w-40 min-w-40 overflow-hidden"
                key={index}
              >
                <span className="overflow-hidden pl-3 whitespace-nowrap text-ellipsis">
                  {member.username}
                </span>
                <Avatar className="rounded-none w-12 h-12">
                  <AvatarImage src={member.avatar_url} className="rounded-none" />
                </Avatar>
              </Card>
            );
          }).filter(Boolean)}
      </div>
    </div>
  );
};
