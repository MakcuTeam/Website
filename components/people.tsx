"use client";
import Image from "next/image";
import { Card } from "./ui/card";

export const People: React.FC<{
  item: { Name: string; Avatar?: string; Url?: string };
}> = ({ item }) => {
  if (item.Url) {
    return (
      <a
        href={item.Url ? item.Url : "#"}
        target={item.Url ? "_blank" : "_self"}
      >
        <Card className="h-14 flex flex-row items-center cursor-pointer overflow-hidden min-w-40 justify-between">
          {item.Avatar && (
            <Image
              src={item.Avatar}
              alt={`avatar-${item.Name}`}
              className="w-14"
              width={200}
              height={200}
            />
          )}
          <span className="px-5 grow text-center">{item.Name}</span>
        </Card>
      </a>
    );
  }
  return (
    <Card className="h-14 flex flex-row items-center overflow-hidden min-w-40 justify-between">
      {item.Avatar && (
        <Image
          src={item.Avatar}
          alt={`avatar-${item.Name}`}
          className="w-14"
          width={200}
          height={200}
        />
      )}
      <span className="px-5 grow text-center">{item.Name}</span>
    </Card>
  );
};

export default People;
