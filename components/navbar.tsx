"use client";

import { ModeToggle } from "@/components/theme-toggle";
import { AudioToggle } from "@/components/audio-toggle";
import { MakcuConnectionButton } from "./makcu-connection-button";

import { SheetLeftbar } from "./leftbar";
import { SheetClose } from "@/components/ui/sheet";
import LangSelect from "./lang-select";
import BaudSelect from "./baud-select";
import { Dictionary } from "@/lib/dictionaries";
import LocalizedLink from "./localized-link";
import SearchBar from "./search-bar";

export function Navbar({ dict }: { dict: Dictionary }) {
  return (
    <nav className="w-full border-b h-16 sticky top-0 z-50  backdrop-blur bg-black/10">
      <div className="w-full h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <SheetLeftbar dict={dict} />
          <div className="flex items-center gap-6">
            <div className="sm:flex hidden">
              <Logo />
            </div>
            <div className="lg:flex hidden items-center gap-4 text-sm font-medium text-muted-foreground">
              <NavMenu dict={dict} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden md:block">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex ml-2.5 sm:ml-0">
              <LangSelect />
              <ModeToggle dict={dict} />
            </div>
          </div>
          <BaudSelect />
          <MakcuConnectionButton dict={dict} />
          <AudioToggle />
        </div>
      </div>
    </nav>
  );
}

export function Logo() {
  return (
    <LocalizedLink href="/" className="flex items-center gap-2.5">
      <h2 className="text-3xl font-bold font-logo tracking-[5px]">Makcu</h2>
    </LocalizedLink>
  );
}
export function NavMenu({
  isSheet = false,
  dict,
}: {
  isSheet?: boolean;
  dict: Dictionary;
}) {

  const NAVLINKS = [
    {
      title: "api",
      href: "/api",
    },
    {
      title: "discord",
      href: "/discord",
      target: "_blank",
    },
    {
      title: "makcu_tools",
      href: "/firmware",
    },
    {
      title: "information",
      href: "/information",
    },
    {
      title: "setup",
      href: "/setup",
    },
    {
      title: "settings",
      href: "/settings",
    },
    {
      title: "xim",
      href: "/xim",
    },
    {
      title: "troubleshooting",
      href: "/troubleshooting",
    },
  ];
  return (
    <>
      {NAVLINKS.map((item) => {
        const Comp = (
          <LocalizedLink
            key={item.title + item.href}
            className="flex items-center gap-1 dark:text-stone-300/85 text-stone-800 "
            activeClassName={item.href ? "dark:text-white font-extrabold" : ""}
            href={item.href ?? ""}
            target={item.target}
          >
            {dict.navbar.links[item.title as keyof typeof dict.navbar.links]}
          </LocalizedLink>
        );
        return isSheet ? (
          <SheetClose key={item.title + item.href} asChild>
            {Comp}
          </SheetClose>
        ) : (
          Comp
        );
      })}
    </>
  );
}
