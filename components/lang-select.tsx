"use client";

import { Button } from "@/components/ui/button";
import { LanguagesIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getLocale, getNextLocale, getLanguageConfig } from "@/lib/locale";
import { useEffect, useState } from "react";

export default function LangSelect() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<string>("en");

  useEffect(() => {
    const locale = getLocale(pathname);
    setCurrentLocale(locale);
  }, [pathname]);

  function handleChangeLocale() {
    const locale = getLocale(pathname);
    const nextLocale = getNextLocale(locale);
    const config = getLanguageConfig(nextLocale);
    
    // Replace the locale in the pathname
    const newPathname = pathname.replace(/^\/[a-z]{2}(\/|$)/, `/${nextLocale}$1`);
    router.push(newPathname);
  }

  const config = getLanguageConfig(currentLocale);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleChangeLocale}
      title={config ? `Switch to ${config.nativeName}` : "Switch language"}
    >
      <LanguagesIcon className="h-[1.1rem] w-[1.1rem]" />
    </Button>
  );
}
