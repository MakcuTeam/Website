"use client";

import InfoCard from "@/components/info-card";
import LocalizedLink from "@/components/localized-link";
import { buttonVariants } from "@/components/ui/button";
import { Cpu, UsersRound, Mouse } from "lucide-react";
import { DiscordCard } from "@/components/discord";
import { useDictionary } from "@/components/contexts/dictionary-provider";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import HomeSidebar from "@/components/home-sidebar";
import useLocale from "@/components/hooks/useLocale";
export default function Home() {
  const dict = useDictionary();
  const lang = useLocale();
  const memberCount = useSelector(
    (state: RootState) => state.discord.data?.member_count
  );

  const iconMap = {
    users_round: UsersRound,
    mouse: Mouse,
    cpu: Cpu,
  };

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
      <HomeSidebar lang={lang} dict={dict} />
      <div className="relative flex flex-col px-2 sm:py-8 py-12 gap-12">
        {/* Content */}
        <div className="relative flex gap-3 flex-col" style={{ zIndex: 10 }}>
        <span className="flex gap-3 items-center mb-12 ">
          <div className="w-full border-b dark:border-b-[hsl(var(--border))] rounded flex-1" />
          <div className="w-auto text-center flex-grow-1 flex-2 text-3xl font-logo">
            {dict.info.title}
          </div>
          <div className="w-full border-b dark:border-b-[hsl(var(--border))] rounded flex-1" />
        </span>

        <div className="gap-3 grid-cols-1 grid md:grid-cols-3 sm:grid-cols-1">
          {dict.info.list.map((item: { icon: string; title: string; number: string; description: string | string[] }, index: number) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            const number =
              item.icon === "users_round"
                ? memberCount?.toString() ?? ""
                : item.number;
            return (
              <InfoCard
                key={index}
                Icon={IconComponent}
                title={item.title}
                number={number}
                description={
                  Array.isArray(item.description)
                    ? item.description
                    : [item.description]
                }
              />
            );
          })}
        </div>
      </div>

      <DiscordCard />

        {/* <div className="flex gap-8 flex-col">
          <span className="flex gap-3 items-center">
            <div className="w-auto text-center flex-grow-1 flex-2 text-xl font-logo">
              {dict.contributions.title}
            </div>
            <div className="w-full border-b dark:border-b-[hsl(var(--border))] rounded flex-1" />
          </span>

          <div className="flex gap-3 items-center flex-wrap">
            
          </div>
        </div> */}
      </div>
    </div>
  );
}
