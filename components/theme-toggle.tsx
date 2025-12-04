"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { Dictionary } from "@/lib/dictionaries";

export function ModeToggle({}: { dict: Dictionary }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle mounted state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine current theme - resolvedTheme is the actual theme after system preference
  // If system theme, use resolvedTheme; otherwise use theme directly
  const currentTheme = resolvedTheme || theme;

  const toggleTheme = () => {
    // Get the actual current theme (resolvedTheme is what's actually showing)
    const actualTheme = resolvedTheme || theme;
    
    // Toggle between light and dark
    if (actualTheme === "light") {
      setTheme("dark");
    } else {
      // If it's dark, system, or undefined, set to light
      setTheme("light");
    }
  };

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
