"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { Dictionary } from "@/lib/dictionaries";

export function ModeToggle({}: { dict: Dictionary }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle mounted state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Simply toggle between light and dark
    console.log("🔄 Theme toggle clicked. Current theme:", theme);
    if (theme === "light") {
      console.log("➡️ Switching to dark mode");
      setTheme("dark");
    } else {
      console.log("➡️ Switching to light mode");
      setTheme("light");
    }
  };

  // Log theme changes and verify HTML class - also force update if needed
  useEffect(() => {
    if (!mounted) return;
    
    console.log("🎨 Theme changed:", theme);
    
    // Force update HTML class to match theme
    const htmlElement = document.documentElement;
    
    if (theme === "light") {
      htmlElement.classList.remove("dark");
      console.log("✅ Removed 'dark' class from HTML (light mode)");
    } else {
      htmlElement.classList.add("dark");
      console.log("✅ Added 'dark' class to HTML (dark mode)");
    }
    
    // Check if HTML class is being updated
    console.log("📋 HTML classes:", htmlElement.className);
    console.log("🌓 Has 'dark' class:", htmlElement.classList.contains("dark"));
    
    // Check computed styles to verify theme is applied
    setTimeout(() => {
      const computedStyle = window.getComputedStyle(htmlElement);
      console.log("🎨 CSS variables:", {
        foreground: computedStyle.getPropertyValue("--foreground"),
        background: computedStyle.getPropertyValue("--background")
      });
    }, 100);
  }, [theme, mounted]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon">
        <Sun className="h-[1.1rem] w-[1.1rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
