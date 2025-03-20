"use client";

import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import Image from "next/image";
import { Avatar, AvatarImage } from "./ui/avatar";
import { BotMessageSquare } from "lucide-react";
interface DiscordType {
  id: string;
  name: string;
  instant_invite: string;
  channels: Channel[];
  members: Member[];
  presence_count: number;
}

interface Channel {
  id: string;
  name: string;
  position: number;
}

interface Member {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  status: string;
  avatar_url: string;
  game?: Game;
}

interface Game {
  name: string;
}

export const DiscordCard = () => {
  const [discord, setDiscord] = useState<DiscordType>();
  const fetchDiscord = async (): Promise<DiscordType | null> => {
    try {
      const response = await fetch(
        "https://discord.com/api/guilds/1274444245184282654/widget.json",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DiscordType = await response.json();
      setDiscord(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch Discord data:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchDiscord();
  }, []);

  const getDiscordMemberRandom = (data: Member[], count: number): Member[] => {
    if (data.length <= count) return data;

    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  return (
    <div className="flex flex-col gap-5">
      <span className="flex gap-3 items-center mb-8">
        <div className="w-full h-[.5px] bg-white/35 rounded flex-1" />
        <div className="w-auto text-center flex-grow-1 flex-2 text-xl font-logo">
          Online Customer ({discord?.presence_count})
        </div>
      </span>

      <div className="flex flex-wrap gap-3 justify-between overflow-hidden relative text-sm">
        <a href={discord?.instant_invite} target="_blank">
          <Card className=" py-3 relative flex gap-3 items-center  bg-[#5865f2] justify-center  uppercase max-w-40 min-w-40 overflow-hidden">
            <BotMessageSquare />
            <span className="text-center">Join Us</span>
          </Card>
        </a>
        {discord &&
          getDiscordMemberRandom(discord?.members, 19).map((i, k) => {
            return (
              <Card
                className="relative flex gap-3 items-center justify-between uppercase  max-w-40 min-w-40 overflow-hidden"
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
        <Card className="p-3 relative flex gap-3 items-center justify-center uppercase max-w-40 min-w-40 overflow-hidden">
          <span className="text-center">...(more)</span>
        </Card>
      </div>
    </div>
  );
};
