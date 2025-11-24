"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/components/contexts/dictionary-provider";
import useLocale from "@/components/hooks/useLocale";
import { searchIndex, type SearchResult } from "@/lib/search-index";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dict = useDictionary();
  const lang = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchIndex(query, dict, lang, 8);
      setResults(searchResults);
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, dict, lang]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, results, selectedIndex]);

  const handleSelectResult = (result: SearchResult) => {
    const href = `/${lang}${result.route}#${result.id}`;
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const placeholder = dict.navbar.search.search_guide || "Search...";

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-md shadow-lg max-h-[400px] overflow-y-auto"
        >
          <div className="p-2">
            {results.map((result, index) => (
              <button
                key={`${result.page}-${result.id}`}
                onClick={() => handleSelectResult(result)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-sm hover:bg-accent transition-colors",
                  index === selectedIndex && "bg-accent"
                )}
              >
                <div className="font-medium text-sm text-foreground">
                  {result.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {result.fullPath}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-md shadow-lg p-4 text-sm text-muted-foreground text-center"
        >
          {dict.navbar.search.no_results_found || "No results found"} "{query}"
        </div>
      )}
    </div>
  );
}

