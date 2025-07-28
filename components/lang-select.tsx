"use client";

import { Button } from "@/components/ui/button";

import { LanguagesIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function LangSelect() {
  const pathname = usePathname();
  const router = useRouter();

  function handleChangeLocale() {
    const currentLocale = pathname.split("/")[1];
    router.push(
      pathname.replace(/\/[a-z]{2}/, `/${currentLocale === "en" ? "cn" : "en"}`)
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleChangeLocale}>
      <LanguagesIcon className="h-[1.1rem] w-[1.1rem]" />
    </Button>
  );
}
