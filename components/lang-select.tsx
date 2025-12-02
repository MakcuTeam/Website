"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguagesIcon, Check } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getLocale, getLanguageConfig, getAllLanguageConfigs, type LanguageConfig } from "@/lib/locale";
import { useEffect, useState } from "react";

export default function LangSelect() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<string>("en");
  const [languages, setLanguages] = useState<LanguageConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const locale = getLocale(pathname);
    setCurrentLocale(locale);
    
    // Try to get languages from client-side first (fallback)
    try {
      const allLanguages = getAllLanguageConfigs();
      if (allLanguages.length > 0) {
        setLanguages(allLanguages);
        setIsLoading(false);
      }
    } catch (error) {
      // If client-side fails, fetch from API
      fetch("/api/languages")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setLanguages(data);
          } else {
            // Final fallback: use current language only
            const currentConfig = getLanguageConfig(locale);
            if (currentConfig) {
              setLanguages([currentConfig]);
            }
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching languages:", err);
          // Fallback: use current language only
          const currentConfig = getLanguageConfig(locale);
          if (currentConfig) {
            setLanguages([currentConfig]);
          }
          setIsLoading(false);
        });
    }
  }, [pathname]);

  function handleChangeLocale(localeCode: string) {
    if (localeCode === currentLocale) return;
    
    // Replace the locale in the pathname
    const newPathname = pathname.replace(/^\/[a-z]{2}(\/|$)/, `/${localeCode}$1`);
    router.push(newPathname);
  }

  const currentConfig = getLanguageConfig(currentLocale);

  // If loading, show loading state
  if (isLoading || languages.length === 0) {
    return (
      <Button 
        variant="ghost" 
        size="icon"
        disabled={isLoading}
        title={isLoading ? "Loading languages..." : "No languages available"}
      >
        <LanguagesIcon className="h-[1.1rem] w-[1.1rem]" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
          title={currentConfig ? `Current: ${currentConfig.nativeName}` : "Select language"}
        >
          <LanguagesIcon className="h-[1.1rem] w-[1.1rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {languages.map((lang) => {
          const isActive = lang.code === currentLocale;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleChangeLocale(lang.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">{lang.flag}</span>
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="font-medium truncate">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">({lang.name})</span>
                </div>
              </div>
              {isActive && (
                <Check className="h-4 w-4 ml-2 flex-shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
