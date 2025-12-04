"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Ensures the HTML element's class is properly synced with the theme
 * This fixes cases where next-themes doesn't properly update the class
 */
export function ThemeSync() {
  const { theme } = useTheme();

  useEffect(() => {
    if (!theme) return;

    const htmlElement = document.documentElement;

    // Force sync HTML class with theme
    if (theme === "light") {
      htmlElement.classList.remove("dark");
      console.log("🔄 ThemeSync: Removed 'dark' class (light mode)");
    } else if (theme === "dark") {
      htmlElement.classList.add("dark");
      console.log("🔄 ThemeSync: Added 'dark' class (dark mode)");
    }

    // Verify sync
    console.log("✅ ThemeSync: HTML classes after sync:", htmlElement.className);
  }, [theme]);

  return null;
}
