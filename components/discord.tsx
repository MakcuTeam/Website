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
        <div className="w-full border-b dark:border-b-[hsl(var(--border))] rounded flex-1" />
        <div className="w-auto text-center flex-grow-1 flex-2 text-xl font-logo">
          Online Customer ({discordStore?.data?.presence_count})
        </div>
      </span>

      <div className="flex flex-wrap gap-3 justify-between overflow-hidden relative text-sm">
        <a href={discordStore?.data?.instant_invite} target="_blank">
          <Card className="text-white py-3 relative flex gap-3 items-center  bg-[#5865f2] justify-center  uppercase max-w-40 min-w-40 overflow-hidden">
            <BotMessageSquare />
            <span className="text-center ">Join Us</span>
          </Card>
        </a>
        {discordStore?.data?.members &&
          discordStore?.data.members.map((i, k) => {
            return (
              <Card
                className="relative bg-transparent backdrop-blur-sm flex gap-3 items-center justify-between uppercase  max-w-40 min-w-40 overflow-hidden"
                key={k}
              >
                <span className="overflow-hidden pl-3 whitespace-nowrap text-ellipsis">
                  {i.username}
                </span>
                <Avatar className="rounded-none w-12 h-12">
                  <AvatarImage src={i.avatar_url} className=" rounded-none" />
                </Avatar>
              </Card>
            );
          })}
        <Card className="p-3 relative flex gap-3 items-center bg-transparent backdrop-blur-sm justify-center uppercase max-w-40 min-w-40 overflow-hidden">
          <span className="text-center">...(more)</span>
        </Card>
      </div>
    </div>
  );
};
