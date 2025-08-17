"use client";

import InfoCard from "@/components/info-card";
import LocalizedLink from "@/components/localized-link";
import { buttonVariants } from "@/components/ui/button";
import { Cpu, MoveUpRightIcon, UsersRound, Mouse } from "lucide-react";
import Link from "next/link";
import ProductImage from "@/assets/makcu.png";
import Image from "next/image";
import { DiscordCard } from "@/components/discord";
import { useDictionary } from "@/components/contexts/dictionary-provider";
import { useSelector } from "react-redux";
import { RootState } from "@/store";


export default function Home() {
  const dict = useDictionary();
  const memberCount = useSelector(
    (state: RootState) => state.discord.data?.member_count
  );

  const iconMap = {
    users_round: UsersRound,
    mouse: Mouse,
    cpu: Cpu,
  };

  return (
    <div className="flex flex-col px-2 sm:py-8 py-12 mt-32 gap-12">
      <div className="sm:flex-row flex flex-col gap-8 sm:gap-2 items-center">
        <div className="flex-1">
          <Link
            href="#"
            className="mb-5 sm:text-lg flex items-center gap-2 underline underline-offset-4 sm:-mt-12"
          >
            {dict.home.tips}
            <MoveUpRightIcon className="w-4 h-4 font-extrabold" />
          </Link>
          <h1 className=" text-3xl font-extrabold mb-4 sm:text-5xl">
            {dict.home.main_header}
          </h1>
          <div className="flex flex-row items-center gap-5 pt-8">
            <LocalizedLink
              href={`/tool`}
              className={buttonVariants({ className: "px-6", size: "lg" })}
            >
              {dict.home.get_started}
            </LocalizedLink>
            {/* <LocalizedLink
              href={`/docs${page_routes[0].href}`}
              className={buttonVariants({
                variant: "secondary",
                className: "px-6",
                size: "lg",
              })}
            >
              {dict.home.read_guide}
            </LocalizedLink> */}
          </div>
        </div>

        <div className="relative">
          <Image
            src={ProductImage}
            className=" grayscale contrast-[100%] invert dark:invert-0 brightness-[.9]"
            alt="product_image"
            loading="eager"
            priority
          />
        </div>
      </div>

      <div className="flex gap-3 flex-col ">
        <span className="flex gap-3 items-center mb-12 ">
          <div className="w-full border-b dark:border-b-[hsl(var(--border))] rounded flex-1" />
          <div className="w-auto text-center flex-grow-1 flex-2 text-3xl font-logo">
            {dict.info.title}
          </div>
          <div className="w-full border-b dark:border-b-[hsl(var(--border))] rounded flex-1" />
        </span>

        <div className="gap-3 grid-cols-1 grid md:grid-cols-3 sm:grid-cols-1">
          {dict.info.list.map((item, index) => {
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
                description={item.description}
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
  );
}
