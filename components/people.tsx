"use client";
import Image from "next/image";
import { Card } from "./ui/card";

export const People: React.FC<{
  item: { Name: string; Avatar?: string; Url?: string };
}> = ({ item }) => {
  return (
    <a href={item.Url ? item.Url : "#"} target={item.Url ? "_blank" : "_self"}>
      <Card className="h-14 flex flex-row items-center cursor-pointer overflow-hidden">
        {item.Avatar && (
           <Image
           src={item.Avatar}
           alt={`avatar-${item.Name}`}
           className="w-14"
           width={200}
           height={200}
           priority
         />
        )}
        <span className="px-5">{item.Name}</span>
      </Card>
    </a>
  );
};

export default People;
