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

    // Verify sync and log CSS variables
    const computedStyle = getComputedStyle(htmlElement);
    const foreground = computedStyle.getPropertyValue("--foreground");
    const background = computedStyle.getPropertyValue("--background");
    const card = computedStyle.getPropertyValue("--card");
    const cardForeground = computedStyle.getPropertyValue("--card-foreground");
    const mutedForeground = computedStyle.getPropertyValue("--muted-foreground");

    console.log("✅ ThemeSync: HTML classes after sync:", htmlElement.className);
    console.log("🎨 ThemeSync: CSS Variables:", {
      theme,
      hasDarkClass: htmlElement.classList.contains("dark"),
      "--foreground": foreground,
      "--background": background,
      "--card": card,
      "--card-foreground": cardForeground,
      "--muted-foreground": mutedForeground,
    });

    // Convert HSL to readable format
    const hslToDesc = (hsl: string) => {
      const parts = hsl.trim().split(" ");
      if (parts.length >= 3) {
        const l = parseFloat(parts[2]);
        return l > 50 ? "light" : "dark";
      }
      return "unknown";
    };

    console.log("📝 ThemeSync: Color interpretation:", {
      foregroundColor: hslToDesc(foreground),
      backgroundColor: hslToDesc(background),
      cardColor: hslToDesc(card),
    });
  }, [theme]);

  return null;
}
